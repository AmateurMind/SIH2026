const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

// Middleware to verify Clerk token
// This uses the Clerk SDK to verify the session token
const clerkAuth = ClerkExpressWithAuth({
    // Optional: Add configuration if needed, but usually env vars are enough
    // publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    // secretKey: process.env.CLERK_SECRET_KEY,
});

// Wrapper to handle errors and attach user info in a standard way
const requireAuth = (req, res, next) => {
    clerkAuth(req, res, (err) => {
        if (err) {
            console.error('Clerk Auth Error:', err);
            return res.status(401).json({ error: 'Unauthenticated' });
        }

        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'Unauthenticated' });
        }

        // Attach user ID to req.user for compatibility with existing code
        // Note: We will need to fetch the full user from DB in the next middleware
        req.clerkUserId = req.auth.userId;
        next();
    });
};

module.exports = { requireAuth };
