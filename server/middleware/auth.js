import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'skillswap_super_secret_jwt_key_for_development_replace_in_production';

/**
 * Mandatory Authentication Middleware
 * Validates Bearer token and attaches user payload to req.user
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed token.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please sign in again.'
    });
  }
};

/**
 * Optional Authentication Middleware
 * If token is present and valid, attaches user; otherwise leaves req.user = null
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
};

/**
 * Role-Based Admin Guard
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Administrator privileges required.'
    });
  }
  next();
};
