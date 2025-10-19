import { supabase, supabaseAdmin } from "../config/supabase.js";
import { generateToken } from "../config/auth.js";
import { 
  isNustian, 
  isValidEmailFormat, 
  validatePassword, 
  validateCmsId, 
  validateRole, 
  validateName 
} from "../utils/validation.js";

/**
 * Register a new user with NUST email and additional information
 */
const register = async (req, res) => {
  try {
    const { name, cmsId, role, email, password } = req.body;

    // Validate required fields
    if (!name || !cmsId || !role || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, cmsId, role, email, password'
      });
    }

    // Validate email format
    if (!isValidEmailFormat(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate NUST email
    if (!isNustian(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only NUST email addresses are allowed for registration'
      });
    }

    // Validate individual fields
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: nameValidation.message
      });
    }

    const cmsIdValidation = validateCmsId(cmsId);
    if (!cmsIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: cmsIdValidation.message
      });
    }

    const roleValidation = validateRole(role);
    if (!roleValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: roleValidation.message
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    // Create user in Supabase with NUST-specific metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          cms_id: parseInt(cmsId),
          role: role.toLowerCase(),
          institution: 'NUST',
          registration_date: new Date().toISOString()
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (data.user && !data.user.email_confirmed_at) {
      return res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your NUST email to confirm your account.',
        user: {
          id: data.user.id,
          name: data.user.user_metadata.name,
          cmsId: data.user.user_metadata.cms_id,
          role: data.user.user_metadata.role,
          email: data.user.email,
          emailConfirmed: false
        }
      });
    }

    // Generate JWT token for immediate login
    const token = generateToken(data.user);

    res.status(201).json({
      success: true,
      message: 'User registered and logged in successfully',
      data: {
        user: {
          id: data.user.id,
          name: data.user.user_metadata.name,
          cmsId: data.user.user_metadata.cms_id,
          role: data.user.user_metadata.role,
          email: data.user.email,
          emailConfirmed: true
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

/**
 * Login user with email and password
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(data.user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: data.user.id,
          name: data.user.user_metadata?.name || '',
          cmsId: data.user.user_metadata?.cms_id || null,
          role: data.user.user_metadata?.role || 'user',
          email: data.user.email,
          emailConfirmed: !!data.user.email_confirmed_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    // Get fresh user data from Supabase
    const { data: userData, error } = await supabase.auth.getUser();
    
    if (error || !userData.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: userData.user.id,
          name: userData.user.user_metadata?.name || '',
          cmsId: userData.user.user_metadata?.cms_id || null,
          role: userData.user.user_metadata?.role || 'user',
          email: userData.user.email,
          institution: userData.user.user_metadata?.institution || 'NUST'
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { user_metadata } = req.body;
    const userId = req.user.id;

    // Update user metadata in Supabase
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata }
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          metadata: data.user.user_metadata
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Request password reset
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Refresh user token
 */
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new JWT token
    const token = generateToken(data.user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: !!data.user.email_confirmed_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  requestPasswordReset,
  refreshToken
};
