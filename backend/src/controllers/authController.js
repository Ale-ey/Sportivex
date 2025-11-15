import bcrypt from "bcryptjs";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { generateToken } from "../config/auth.js";
import { 
  isValidEmailFormat, 
  validatePassword, 
  validateCmsId, 
  validateRole, 
  validateName 
} from "../utils/validation.js";

/**
 * Register a new user with email and additional information
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

    // Check if user already exists with this email
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users_metadata')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (userError) {
      console.error('Error checking existing user:', userError);
      return res.status(500).json({
        success: false,
        message: 'Error checking user existence'
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if CMS ID already exists
    const { data: existingCmsId, error: cmsError } = await supabaseAdmin
      .from('users_metadata')
      .select('id')
      .eq('cms_id', parseInt(cmsId))
      .maybeSingle();

    if (cmsError) {
      console.error('Error checking existing CMS ID:', cmsError);
      return res.status(500).json({
        success: false,
        message: 'Error checking CMS ID existence'
      });
    }

    if (existingCmsId) {
      return res.status(400).json({
        success: false,
        message: 'User with this CMS ID already exists'
      });
    }

    // Hash the password using bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into users_metadata table
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users_metadata')
      .insert([
        {
          name: name.trim(),
          cms_id: parseInt(cmsId),
          role: role.toLowerCase(),
          email: email.toLowerCase(),
          password_hash: passwordHash,
          institution: 'NUST',
          registration_date: new Date().toISOString(),
          email_confirmed: false
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      cms_id: newUser.cms_id
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your  email to confirm your account.',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          cmsId: newUser.cms_id,
          role: newUser.role,
          email: newUser.email,
          emailConfirmed: newUser.email_confirmed,
          institution: newUser.institution
        },
        access_token: token,
        token: token,
        expires_in: '1h'
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

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users_metadata')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      cms_id: user.cms_id
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          cmsId: user.cms_id,
          role: user.role,
          email: user.email,
          emailConfirmed: user.email_confirmed,
          institution: user.institution
        },
        access_token: token,
        token: token,
        expires_in: '1h'
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
 * Logout user (client-side token removal)
 */
const logout = (_req, res) => {
  try {
    // With JWT, logout is handled client-side by removing the token
    // Optionally, implement token blacklisting here for added security
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please remove the token from client storage.'
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
    // User ID comes from JWT token (set by auth middleware)
    const userId = req.user.id;

    // Fetch user from database
    const { data: user, error } = await supabase
      .from('users_metadata')
      .select('id, name, cms_id, role, email, institution, phone, date_of_birth, address, profile_picture_url, bio, email_confirmed, registration_date')
      .eq('id', userId)
      .single();
    
    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          cmsId: user.cms_id,
          role: user.role,
          email: user.email,
          institution: user.institution,
          phone: user.phone,
          dateOfBirth: user.date_of_birth,
          address: user.address,
          profilePictureUrl: user.profile_picture_url,
          bio: user.bio,
          emailConfirmed: user.email_confirmed,
          registrationDate: user.registration_date
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
    const userId = req.user.id;
    const { name, phone, dateOfBirth, address, profilePictureUrl, bio } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth;
    if (address !== undefined) updateData.address = address;
    if (profilePictureUrl !== undefined) updateData.profile_picture_url = profilePictureUrl;
    if (bio !== undefined) updateData.bio = bio;

    // Validate name if provided
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: nameValidation.message
        });
      }
    }

    // Update user in database
    const { data: updatedUser, error } = await supabase
      .from('users_metadata')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          cmsId: updatedUser.cms_id,
          role: updatedUser.role,
          email: updatedUser.email,
          phone: updatedUser.phone,
          dateOfBirth: updatedUser.date_of_birth,
          address: updatedUser.address,
          profilePictureUrl: updatedUser.profile_picture_url,
          bio: updatedUser.bio
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

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users_metadata')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user && !error) {
      // TODO: Implement email sending service
      // Generate a password reset token (separate from JWT)
      // Store it in database with expiration
      // Send email with reset link
      console.log(`Password reset requested for user: ${user.email}`);
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
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
 * Reset password with token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    // TODO: Implement password reset token verification
    // 1. Verify reset token from database
    // 2. Check if token is not expired
    // 3. Get user ID from token
    // 4. Update password
    // 5. Delete used token

    res.status(200).json({
      success: true,
      message: 'Password reset functionality to be implemented with email service'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Change password for authenticated user
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users_metadata')
      .select('id, password_hash')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from('users_metadata')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Refresh user token (generate new JWT)
 */
const refreshToken = async (req, res) => {
  try {
    // User info comes from current JWT token (validated by middleware)
    const userId = req.user.id;

    // Fetch fresh user data from database
    const { data: user, error } = await supabase
      .from('users_metadata')
      .select('id, email, role, cms_id')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new JWT token
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      cms_id: user.cms_id
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          cmsId: user.cms_id
        },
        access_token: newToken,
        token: newToken,
        expires_in: '1h'
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
  resetPassword,
  changePassword,
  refreshToken
};
