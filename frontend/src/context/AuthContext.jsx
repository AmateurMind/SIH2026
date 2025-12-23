import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth as useClerkAuth, useUser, useSignIn } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const LEGACY_TOKEN_KEY = 'token';

// Store getToken function globally for axios interceptor
let globalGetToken = null;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, userId, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signIn, setActive } = useSignIn();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const interceptorRef = useRef(null);

  // Update global getToken reference
  useEffect(() => {
    globalGetToken = getToken;
  }, [getToken]);

  // Setup axios interceptor to add auth token to every request
  useEffect(() => {
    // Remove existing interceptor if any
    if (interceptorRef.current !== null) {
      axios.interceptors.request.eject(interceptorRef.current);
    }

    // Add request interceptor
    interceptorRef.current = axios.interceptors.request.use(
      async (config) => {
        // Skip if already has authorization header (legacy token)
        if (config.headers.Authorization) {
          return config;
        }

        // Try to get Clerk token
        if (globalGetToken && isSignedIn) {
          try {
            const token = await globalGetToken({ template: 'backend' });
            console.log('[AuthContext] Clerk token obtained:', token ? `${token.substring(0, 30)}...` : 'null');
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
              console.log('[AuthContext] Authorization header set for:', config.url);
            }
          } catch (error) {
            console.warn('[AuthContext] Failed to get Clerk token for request:', error);
          }
        } else {
          console.log('[AuthContext] Skipping Clerk token - globalGetToken:', !!globalGetToken, 'isSignedIn:', isSignedIn);
        }

        // Fallback to legacy token
        if (!config.headers.Authorization) {
          const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
          if (legacyToken) {
            config.headers.Authorization = `Bearer ${legacyToken}`;
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      if (interceptorRef.current !== null) {
        axios.interceptors.request.eject(interceptorRef.current);
      }
    };
  }, [isSignedIn]);

  const getLegacyToken = () => {
    try {
      return localStorage.getItem(LEGACY_TOKEN_KEY);
    } catch (storageError) {
      console.error('Unable to read legacy token from storage', storageError);
      return null;
    }
  };

  const persistLegacyToken = (token) => {
    if (!token) return;
    try {
      localStorage.setItem(LEGACY_TOKEN_KEY, token);
    } catch (storageError) {
      console.error('Unable to persist legacy token', storageError);
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const clearLegacyToken = () => {
    try {
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch (storageError) {
      console.error('Unable to remove legacy token from storage', storageError);
    }
  };

  const buildFallbackUserFromClerk = () => {
    if (!clerkUser) return null;
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
    const firstName = clerkUser.firstName?.trim();
    const lastName = clerkUser.lastName?.trim();
    const derivedName = [firstName, lastName].filter(Boolean).join(' ') || clerkUser.username || primaryEmail || 'Student';

    return {
      id: clerkUser.id,
      clerkId: clerkUser.id,
      email: primaryEmail,
      name: derivedName,
      role: clerkUser.publicMetadata?.role
    };
  };

  const normalizeUser = (rawUser, fallbackUser = null) => {
    if (!rawUser && !fallbackUser) return null;
    const mergedUser = { ...fallbackUser, ...rawUser };
    const normalizedRole = (mergedUser.role || 'student').toLowerCase();
    const normalizedName = mergedUser.name || mergedUser.email?.split('@')[0] || 'Student';

    return {
      ...mergedUser,
      role: normalizedRole,
      name: normalizedName
    };
  };

  // Sync Clerk user with backend MongoDB user
  useEffect(() => {
    const syncUserWithBackend = async () => {
      console.log('AuthContext: syncUserWithBackend called', { isLoaded, isSignedIn, clerkUser: !!clerkUser });
      const legacyToken = getLegacyToken();

      if (isLoaded && isSignedIn && clerkUser) {
        const fallbackUser = buildFallbackUserFromClerk();
        try {
          const token = await getToken();
          console.log('AuthContext: got Clerk token:', token ? `${token.substring(0, 50)}...` : 'NULL');
          if (!token) {
            console.error('AuthContext: Clerk returned null token!');
            // Use fallback user since we can't get backend profile
            const normalizedFallback = normalizeUser(null, fallbackUser);
            if (normalizedFallback) {
              setUser(normalizedFallback);
            }
            setLoading(false);
            return;
          }

          // Set the token directly in headers for this request
          console.log('AuthContext: fetching /auth/profile with token');
          const response = await axios.get('/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('AuthContext: profile response', response.data);
          const normalizedUser = normalizeUser(response.data?.user, fallbackUser);
          setUser(normalizedUser);
          console.log('AuthContext: user set', response.data.user);
          clearLegacyToken();
        } catch (error) {
          console.error('Failed to sync user with backend:', error.response?.status, error.response?.data || error.message);
          const normalizedFallback = normalizeUser(null, fallbackUser);
          if (normalizedFallback) {
            setUser(normalizedFallback);
          }
        } finally {
          console.log('AuthContext: setting loading to false');
          setLoading(false);
        }
      } else if (legacyToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${legacyToken}`;
          console.log('AuthContext: fetching /auth/profile via legacy token');
          const response = await axios.get('/auth/profile');
          const normalizedUser = normalizeUser(response.data?.user);
          setUser(normalizedUser);
        } catch (legacyError) {
          console.error('Failed to sync legacy session:', legacyError);
          clearLegacyToken();
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        } finally {
          setLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        console.log('AuthContext: not signed in, clearing user');
        setUser(null);
        clearLegacyToken();
        delete axios.defaults.headers.common['Authorization'];
        setLoading(false);
      } else {
        console.log('AuthContext: conditions not met for sync');
      }
    };

    syncUserWithBackend();
  }, [isLoaded, isSignedIn, clerkUser, getToken]);

  const shouldFallbackToLegacy = (error) => {
    const status = error?.status || error?.response?.status;
    const code = error?.errors?.[0]?.code;
    const message = error?.errors?.[0]?.message || error?.message || '';
    if (status === 422 || status === 404) return true;
    if (code === 'form_identifier_not_found' || code === 'form_password_incorrect') return true;
    if (status === 400 && message.toLowerCase().includes('verification strategy')) return true;
    return message.includes("Couldn't find your account");
  };

  const legacyLogin = async (credentials, rememberMe = false) => {
    try {
      const response = await axios.post('/auth/login', { ...credentials, rememberMe });
      const { token, user: legacyUser } = response.data;
      if (token) {
        persistLegacyToken(token);
      }
      const normalizedUser = normalizeUser(legacyUser);
      setUser(normalizedUser);
      setLoading(false);
      toast.success('Welcome back!');
      return { success: true };
    } catch (legacyError) {
      console.error('Legacy login error:', legacyError);
      const message = legacyError.response?.data?.error || legacyError.message || 'Login failed';
      toast.error(message);
      clearLegacyToken();
      delete axios.defaults.headers.common['Authorization'];
      return { success: false, error: message };
    }
  };

  const login = async (credentials, rememberMe = false) => {
    if (isLoaded && signIn) {
      try {
        const result = await signIn.create({
          identifier: credentials.email,
          password: credentials.password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          toast.success(`Welcome back!`);
          return { success: true };
        }

        console.error("SignIn status:", result.status);
        return { success: false, error: 'Login incomplete. Check console.' };
      } catch (error) {
        console.error('Login error:', error);
        if (!shouldFallbackToLegacy(error)) {
          const message = error.errors?.[0]?.message || error.message || 'Login failed';
          toast.error(message);
          return { success: false, error: message };
        }
      }
    }

    // Either Clerk rejected the credentials for a demo user or Clerk is not ready.
    return legacyLogin(credentials, rememberMe);
  };

  const register = async (userData) => {
    // For now, we'll redirect to Clerk's hosted sign-up or implement custom sign-up later
    // Since the user asked to preserve data, we assume most users exist.
    // If we need custom registration, we'd use signUp.create()
    toast.error("Please use the 'Create an account' link to sign up via Clerk.");
    return { success: false, error: "Use Clerk Sign Up" };
  };

  const logout = async () => {
    try {
      if (isLoaded && isSignedIn) {
        await signOut();
      }
      setUser(null);
      clearLegacyToken();
      delete axios.defaults.headers.common['Authorization'];
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const activeUserId = clerkUser?.id || user?.clerkId || user?.id || null;

  const value = {
    user, // This is the MongoDB user object (synced)
    clerkUser, // This is the Clerk user object
    activeUserId,
    login,
    register,
    logout,
    loading: loading || !isLoaded,
    isClerkLoaded: isLoaded,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};