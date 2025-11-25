import { verifyToken } from '../config/auth.js';
import { supabase } from '../config/supabase.js';

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    // Get user from database to ensure user still exists and is active
    const { data: user, error } = await supabase
      .from('users_metadata')
      .select('id, email, role, cms_id, name, email_confirmed, gender')
      .eq('id', decoded.id)
      .single();
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      cmsId: user.cms_id,
      name: user.name,
      emailConfirmed: user.email_confirmed,
      gender: user.gender
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle JWT specific errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if user has a specific role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user's email is confirmed
 */
const requireEmailConfirmed = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.emailConfirmed) {
    return res.status(403).json({
      success: false,
      message: 'Please confirm your email address to access this resource'
    });
  }

  next();
};

export {
  authenticateToken,
  requireRole,
  requireEmailConfirmed
};
