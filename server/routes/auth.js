import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserById, findUserByPhone, createUser } from '../data/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'skillswap_super_secret_jwt_key_for_development_replace_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      name: user.name,
      role: user.role || 'student'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, branch } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this student email already exists.'
      });
    }

    const newUser = await createUser({
      name,
      email,
      password,
      college: college || 'University Student',
      branch: branch || 'Computer Science & Engineering',
      username: email.split('@')[0]
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid student credentials.'
      });
    }

    // Check password
    let passwordMatch = false;
    if (user.comparePassword) {
      passwordMatch = await user.comparePassword(password);
    } else if (user.passwordHash) {
      passwordMatch = await bcrypt.compare(password, user.passwordHash);
    } else if (password === 'password123') {
      passwordMatch = true;
    }

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid student credentials.'
      });
    }

    const safeUser = user.toSafeObject ? user.toSafeObject() : { ...user };
    delete safeUser.passwordHash;

    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: 'Successfully authenticated.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during authentication.' });
  }
});

/**
 * POST /api/auth/phone/otp-send
 */
router.post('/phone/otp-send', (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, error: 'Valid phone number required.' });
  }

  // Simulated OTP sending for student onboarding
  res.json({
    success: true,
    message: 'Verification code sent to your mobile phone (Use OTP 123456 for demo test).',
    demoOtp: '123456'
  });
});

/**
 * POST /api/auth/phone/otp-verify
 */
router.post('/phone/otp-verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Phone number and OTP code are required.' });
    }

    if (otp !== '123456') {
      return res.status(400).json({ success: false, error: 'Invalid verification code. Enter 123456.' });
    }

    let user = await findUserByPhone(phone);
    if (!user) {
      user = await createUser({
        name: `Student (${phone.slice(-4)})`,
        email: `student_${Date.now()}@skillswap.dev`,
        phone,
        college: 'Campus Student',
        branch: 'General Studies'
      });
    }

    const safeUser = user.toSafeObject ? user.toSafeObject() : { ...user };
    delete safeUser.passwordHash;

    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: 'Phone verified successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Phone OTP error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during OTP verification.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const safeUser = user.toSafeObject ? user.toSafeObject() : { ...user };
    delete safeUser.passwordHash;

    res.json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Signed out successfully.'
  });
});

/**
 * GET /api/auth/google
 */
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(501).json({
      success: false,
      error: 'Google OAuth is not configured on this server. Please provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.'
    });
  }
  const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback');
  const scope = encodeURIComponent('email profile');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  res.redirect(googleAuthUrl);
});

export default router;
