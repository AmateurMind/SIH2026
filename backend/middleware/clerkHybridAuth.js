const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('@clerk/express');
const { clerkClient } = require('@clerk/clerk-sdk-node');
const mongoose = require('mongoose');
const { Student, Admin, Mentor, Recruiter } = require('../models');

const NEW_TEMPLATE = process.env.CLERK_NEW_JWT_TEMPLATE_NAME;
const LEGACY_TEMPLATE = process.env.CLERK_LEGACY_JWT_TEMPLATE_NAME;
const NEW_AUDIENCE = process.env.CLERK_NEW_JWT_AUDIENCE;
const LEGACY_AUDIENCE = process.env.CLERK_LEGACY_JWT_AUDIENCE;
const ISSUER = process.env.CLERK_JWT_ISSUER;
const JWT_SECRET = process.env.JWT_SECRET || 'campus-placement-secret';

const decodePayload = (token) => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT');
  }
  const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
  return JSON.parse(payload);
};

const getTemplateFromClaims = (claims) => (
  claims?.template || null
);

const isMongoConnected = () => mongoose.connection.readyState === 1;

const loadUsersFromJSON = () => {
  const dataDir = path.join(__dirname, '../data');
  const files = ['students.json', 'admins.json', 'mentors.json', 'recruiters.json'];
  const users = [];

  files.forEach((file) => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      try {
        users.push(...JSON.parse(fs.readFileSync(filePath, 'utf8')));
      } catch (error) {
        console.error(`[auth] Failed to parse ${file}:`, error.message);
      }
    }
  });

  return users;
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const plain = user.toObject ? user.toObject() : { ...user };
  if (plain.password) delete plain.password;
  return plain;
};

const generateStudentId = async () => {
  // Find the highest ID by numeric value logic using aggregation or just robust checking
  const students = await Student.find({}, { id: 1 }).lean();

  let maxNum = 0;
  students.forEach(s => {
    if (s.id && s.id.startsWith('STU')) {
      const num = parseInt(s.id.replace('STU', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  let nextNum = maxNum + 1;
  let newId = `STU${String(nextNum).padStart(3, '0')}`;

  // Double check existence (optimistic locking style)
  while (await Student.findOne({ id: newId })) {
    nextNum++;
    newId = `STU${String(nextNum).padStart(3, '0')}`;
  }

  return newId;
};

const resolveStudentFromClerk = async (clerkUserId) => {
  if (!clerkUserId) return null;

  let user = await Student.findOne({ clerkId: clerkUserId });
  if (user) return sanitizeUser(user);

  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const firstName = clerkUser.firstName?.trim();
    const lastName = clerkUser.lastName?.trim();
    const derivedName = [firstName, lastName].filter(Boolean).join(' ') || email?.split('@')[0];

    if (!email) {
      console.warn('[auth] Clerk user missing email');
      return null;
    }

    user = await Student.findOne({ email });
    if (user) {
      user.clerkId = clerkUserId;
      await user.save();
      return sanitizeUser(user);
    }

    const studentId = await generateStudentId();
    const newStudent = new Student({
      id: studentId,
      name: derivedName || 'Student',
      email,
      role: 'student',
      department: 'Not specified',
      semester: 1,
      cgpa: 0,
      clerkId: clerkUserId,
      skills: [],
      projects: [],
      achievements: [],
      isPlaced: false,
      placementStatus: 'active',
    });

    await newStudent.save();
    return sanitizeUser(newStudent);
  } catch (error) {
    console.error('[auth] Failed to fetch/link Clerk user', error.message);
    return null;
  }
};

const resolveCampusUser = async (claims) => {
  const { id, email } = claims || {};
  if (!id && !email) {
    return null;
  }

  let user = null;

  if (isMongoConnected()) {
    user = await Student.findOne({ id, email }).lean()
      || await Admin.findOne({ id, email }).lean()
      || await Mentor.findOne({ id, email }).lean()
      || await Recruiter.findOne({ id, email }).lean();
  }

  if (!user) {
    const fallbackUsers = loadUsersFromJSON();
    user = fallbackUsers.find((u) => (id && u.id === id) || (email && u.email === email));
  }

  return sanitizeUser(user);
};

const determineAuthType = (template, claims) => {
  if (!claims) return 'campus-legacy';

  // Check by Template Name
  if (template && template === NEW_TEMPLATE) return 'clerk-modern';
  if (template && LEGACY_TEMPLATE && template === LEGACY_TEMPLATE) return 'clerk-legacy';

  // Check by Issuer (Strong signal)
  if (claims.iss && ISSUER && claims.iss === ISSUER) {
    // Helper to check audience (handle string or array)
    const checkAud = (aud, expected) => {
      if (!aud || !expected) return false;
      if (Array.isArray(aud)) return aud.includes(expected);
      return aud === expected;
    };

    if (checkAud(claims.aud, NEW_AUDIENCE)) return 'clerk-modern';
    if (checkAud(claims.aud, LEGACY_AUDIENCE)) return 'clerk-legacy';

    // Default to modern if issuer matches but audience is ambiguous
    return 'clerk-modern';
  }

  return 'campus-legacy';
};

const logClaimsSummary = (claims) => ({
  userId: claims?.sub || claims?.id,
  sessionId: claims?.sid || claims?.session_id,
  audience: claims?.aud,
  issuer: claims?.iss,
  expiresAt: claims?.exp,
});

const requireHybridAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('[auth] Route:', req.originalUrl);
  console.log('[auth] Incoming header:', authHeader ? 'Bearer' : 'Missing');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[auth] Verification failed:', 'Missing Authorization header');
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  let decoded;

  try {
    decoded = decodePayload(token);
  } catch (error) {
    console.error('[auth] Verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token format' });
  }

  const template = getTemplateFromClaims(decoded);
  console.log('[auth] Token template:', template || 'none');

  let selectedAuthType = determineAuthType(template, decoded);
  // Relaxed check: We will rely on determineAuthType to check audience/issuer
  // if ((decoded?.iss === ISSUER) && template && template !== NEW_TEMPLATE && template !== LEGACY_TEMPLATE) { ... }

  req.authType = selectedAuthType;
  console.log('[auth] Selected authType:', req.authType);

  try {
    let claims;

    if (selectedAuthType === 'campus-legacy') {
      claims = jwt.verify(token, JWT_SECRET);
    } else {
      const expectedAudience = selectedAuthType === 'clerk-modern' ? NEW_AUDIENCE : LEGACY_AUDIENCE;

      // Debug log for Secret Key presence
      if (!process.env.CLERK_SECRET_KEY) {
        console.error('[auth] CRITICAL: CLERK_SECRET_KEY is missing in environment variables!');
      } else {
        console.log('[auth] CLERK_SECRET_KEY is present (starts with ' + process.env.CLERK_SECRET_KEY.substring(0, 7) + '...)');
      }

      // Use clerkClient.verifyToken for better integration
      claims = await clerkClient.verifyToken(token, {
        audience: expectedAudience,
        issuer: ISSUER,
        secretKey: process.env.CLERK_SECRET_KEY, // Explicitly pass it just in case
        clockSkewInMs: 60000, // Allow 1 minute of clock skew to prevent NBF errors
        tokenVerificationMetadata: template ? { authorizedParties: [template] } : undefined,
      });
    }

    req.auth = {
      userId: claims.sub || claims.id,
      sessionId: claims.sid || claims.session_id || null,
      template: template || (selectedAuthType === 'campus-legacy' ? 'campus-legacy' : null),
      authType: selectedAuthType,
      claims,
    };

    console.log('[auth] Claims summary:', logClaimsSummary(claims));

    let user = null;
    if (selectedAuthType === 'campus-legacy') {
      user = await resolveCampusUser(claims);
    } else if (isMongoConnected()) {
      user = await resolveStudentFromClerk(req.auth.userId);
    } else {
      console.error('[auth] Verification failed:', 'Database unavailable for Clerk user sync');
      return res.status(503).json({ error: 'Database unavailable' });
    }

    if (!user) {
      console.error('[auth] Verification failed:', 'User profile not found');
      return res.status(404).json({ error: 'User profile not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('[auth] Verification failed:', error.message);
    const status = req.authType === 'campus-legacy' ? 401 : 403;
    const errorMessage = status === 403 ? 'Forbidden' : 'Unauthorized';
    return res.status(status).json({ error: errorMessage, details: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
};

module.exports = requireHybridAuth;
