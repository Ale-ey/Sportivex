import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { generateToken } from "../config/auth.js";
import { sendEmail } from "../utils/email.js";
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
    const { name, cmsId, role, email, password, gender } = req.body;

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

    // Validate gender if provided (optional field)
    if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be one of: male, female, other'
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

    // Build user data object matching schema
    const userData = {
      name: name.trim(),
      cms_id: parseInt(cmsId),
      role: role.toLowerCase(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      institution: 'NUST',
      email_confirmed: false
    };

    // Add gender if provided (optional field)
    if (gender) {
      userData.gender = gender.toLowerCase();
    }

    // Insert user into users_metadata table
    // Note: registration_date, created_at, updated_at have defaults in schema
    const { data: newUser, error: insertError } = await supabase
      .from('users_metadata')
      .insert([userData])
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
    if (bio !== undefined) updateData.bio = bio;

    // Handle file upload if provided
    if (req.file) {
      try {
        // Get existing profile picture URL to delete old one later
        const { data: existingUser } = await supabase
          .from('users_metadata')
          .select('profile_picture_url')
          .eq('id', userId)
          .single();

        // Generate unique filename
        const fileExt = req.file.originalname.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `profile-pictures/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from('profile-pictures')
          .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload profile picture'
          });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin
          .storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        // getPublicUrl returns { data: { publicUrl: string } }
        const publicUrl = urlData?.publicUrl;

        if (!publicUrl) {
          return res.status(500).json({
            success: false,
            message: 'Failed to get profile picture URL'
          });
        }

        updateData.profile_picture_url = publicUrl;

        // Delete old profile picture if it exists and is from our storage
        if (existingUser?.profile_picture_url) {
          const oldUrl = existingUser.profile_picture_url;
          // Check if old URL is from our storage bucket
          if (oldUrl.includes('/profile-pictures/')) {
            const oldFileName = oldUrl.split('/profile-pictures/')[1];
            if (oldFileName && oldFileName !== fileName) {
              // Delete old file (don't wait for this, just fire and forget)
              supabaseAdmin
                .storage
                .from('profile-pictures')
                .remove([oldFileName])
                .catch(err => console.error('Error deleting old profile picture:', err));
            }
          }
        }
      } catch (fileError) {
        console.error('File upload error:', fileError);
        return res.status(500).json({
          success: false,
          message: 'Error processing profile picture upload'
        });
      }
    } else if (profilePictureUrl !== undefined) {
      // If profilePictureUrl is provided in body (for URL-based updates)
      updateData.profile_picture_url = profilePictureUrl;
    }

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
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const { data: user } = await supabase
      .from("users_metadata")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .single();

    // Same behavior even if user does not exist
    if (user) {
      const token = crypto.randomBytes(40).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 min

      await supabaseAdmin.from("password_reset_tokens").insert([
        {
          user_id: user.id,
          token,
          expires_at: expiresAt
        }
      ]);

      const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/set-new-password?token=${token}`;

      try {
        await sendEmail(
          user.email,
          "Reset your password",
          `<p>Click here to reset your password:</p>
           <a href="${resetLink}">Reset Password</a>
           <p>Or copy this link: ${resetLink}</p>
           <p>This link will expire in 15 minutes.</p>`
        );
        console.log("Password reset email sent to:", user.email);
      } catch (emailError) {
        // Log error but don't fail the request
        // Token is still created, user can use it if they know the link
        console.error(" Failed to send password reset email:", emailError.message);
        console.log("Password reset link (for manual sharing):", resetLink);
      }
    }

    return res.status(200).json({
      success: true,
      message: "If an account exists, a password reset link has been sent."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
        message: "Token and new password are required"
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

    // 1. Validate token
    const { data: resetRecord } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used")
      .eq("token", token)
      .maybeSingle();

    if (!resetRecord || resetRecord.used || new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // 2. Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // 3. Update user password
    const { error: updateError } = await supabaseAdmin
      .from("users_metadata")
      .update({ password_hash: newHash })
      .eq("id", resetRecord.user_id);

    if (updateError) {
      console.error("Password update error:", updateError);
      return res.status(500).json({
        success: false,
        message: "Failed to update password"
      });
    }

    // 4. Mark token as used
    await supabaseAdmin
      .from("password_reset_tokens")
      .update({ used: true })
      .eq("id", resetRecord.id);

    return res.status(200).json({ success: true, message: "Password reset successful" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  changePassword,
  refreshToken
};
