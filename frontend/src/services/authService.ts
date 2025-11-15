import apiInvoker from "../lib/apiInvoker";
import { END_POINT } from "../lib/apiURL";
import { setToken, removeToken } from "../utils/localStorage";

// Type definitions
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  cmsId: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  role?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  cmsId: string;
  role: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ProfileResponse {
  message: string;
  user: User;
}

export interface UpdateProfileResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface RequestPasswordResetResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface RefreshTokenResponse {
  message: string;
  token: string;
}

export interface LogoutResponse {
  message: string;
}

// Auth Service Functions
export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    // Transform fullName to name for backend compatibility
    const payload = {
      name: data.fullName,
      email: data.email,
      password: data.password,
      cmsId: data.cmsId,
      role: data.role,
    };
    
    const response = await apiInvoker<any>(
      END_POINT.auth.register,
      "POST",
      payload
    );
    
    // Transform backend response to match frontend interface
    // Backend returns: { success: true, message: '...', data: { user: { name: ... }, token: ... } }
    // Frontend expects: { message: '...', user: { fullName: ... }, token: ... }
    const backendData = response.data || response;
    const transformedResponse: RegisterResponse = {
      message: response.message || 'Registration successful',
      user: {
        id: backendData.user?.id || '',
        fullName: backendData.user?.name || data.fullName,
        email: backendData.user?.email || data.email,
        cmsId: backendData.user?.cmsId || data.cmsId,
        role: backendData.user?.role || data.role,
      },
      token: backendData.token || backendData.access_token || '',
    };
    
    if (transformedResponse.token) {
      setToken(transformedResponse.token);
    }
    return transformedResponse;
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiInvoker<LoginResponse>(
      END_POINT.auth.login,
      "POST",
      data
    );
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  /**
   * Logout user (protected route)
   */
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiInvoker<LogoutResponse>(
      END_POINT.auth.logout,
      "POST"
    );
    removeToken();
    return response;
  },

  /**
   * Get user profile (protected route)
   */
  getProfile: async (): Promise<ProfileResponse> => {
    return await apiInvoker<ProfileResponse>(END_POINT.auth.profile, "GET");
  },

  /**
   * Update user profile (protected route)
   */
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> => {
    return await apiInvoker<UpdateProfileResponse>(
      END_POINT.auth.updateProfile,
      "PUT",
      data
    );
  },

  /**
   * Change password (protected route)
   */
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    return await apiInvoker<ChangePasswordResponse>(
      END_POINT.auth.changePassword,
      "POST",
      data
    );
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (
    data: RequestPasswordResetRequest
  ): Promise<RequestPasswordResetResponse> => {
    return await apiInvoker<RequestPasswordResetResponse>(
      END_POINT.auth.requestPasswordReset,
      "POST",
      data
    );
  },

  /**
   * Reset password
   */
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    return await apiInvoker<ResetPasswordResponse>(
      END_POINT.auth.resetPassword,
      "POST",
      data
    );
  },

  /**
   * Refresh token (protected route)
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await apiInvoker<RefreshTokenResponse>(
      END_POINT.auth.refreshToken,
      "POST"
    );
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },
};

