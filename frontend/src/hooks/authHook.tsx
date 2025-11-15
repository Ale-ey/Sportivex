import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  type RegisterFormData,
  type LoginFormData,
  type UpdateProfileFormData,
  type ChangePasswordFormData,
  type RequestPasswordResetFormData,
  type ResetPasswordFormData,
} from "../validator/auth.validator";
import {
  authService,
  type User,
  type RegisterResponse,
  type LoginResponse,
  type ProfileResponse,
  type UpdateProfileResponse,
  type ChangePasswordResponse,
  type RequestPasswordResetResponse,
  type ResetPasswordResponse,
  type RefreshTokenResponse,
  type LogoutResponse,
} from "../services/authService";

// Register Hook
export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: RegisterResponse = await authService.register(data);
      reset();
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    error,
    reset,
  };
};

// Login Hook
export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: LoginResponse = await authService.login(data);
      reset();
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    error,
    reset,
  };
};

// Logout Hook
export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: LogoutResponse = await authService.logout();
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || "Logout failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading, error };
};

// Get Profile Hook
export const useGetProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: ProfileResponse = await authService.getProfile();
      setUser(response.user);
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || "Failed to fetch profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { getProfile, user, isLoading, error };
};

// Update Profile Hook
export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: UpdateProfileResponse = await authService.updateProfile(
        data
      );
      reset();
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || "Profile update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    error,
    reset,
  };
};

// Change Password Hook
export const useChangePassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: ChangePasswordResponse =
        await authService.changePassword(data);
      reset();
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || "Password change failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    error,
    reset,
  };
};

// Request Password Reset Hook
export const useRequestPasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
  });

  const onSubmit = async (data: RequestPasswordResetFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: RequestPasswordResetResponse =
        await authService.requestPasswordReset(data);
      reset();
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to request password reset";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    error,
    reset,
  };
};

// Reset Password Hook
export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: ResetPasswordResponse = await authService.resetPassword(
        data
      );
      reset();
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || "Password reset failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isLoading,
    error,
    reset,
  };
};

// Refresh Token Hook
export const useRefreshToken = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: RefreshTokenResponse = await authService.refreshToken();
      return { success: true, data: response };
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || err?.message || "Token refresh failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { refreshToken, isLoading, error };
};

