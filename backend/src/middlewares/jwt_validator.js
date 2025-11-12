import { verifyToken } from '../config/auth.js';
import { supabase } from '../config/supabase.js';

// Paths that do not require JWT validation
const PUBLIC_PATHS = new Set([
  '/health',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/request-password-reset',
  '/api/auth/reset-password'
]);

const isPublicPath = (path) => {
  return PUBLIC_PATHS.has(path);
};

const jwtValidator = async (req, res, next) => {
  try {
    // Allow preflight and public paths
    if (req.method === 'OPTIONS' || isPublicPath(req.path)) {
      return next();
    }

    const authHeader = req.headers['authorization'] || req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT
    const decoded = verifyToken(token);

    // Ensure user still exists in DB
    const { data: user, error } = await supabase
      .from('users_metadata')
      .select('id, email, role, cms_id, name, email_confirmed')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Attach user to request for downstream handlers
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      cmsId: user.cms_id,
      name: user.name,
      emailConfirmed: user.email_confirmed
    };

    return next();
  } catch (error) {
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

export default jwtValidator;


