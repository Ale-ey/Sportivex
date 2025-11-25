import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
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
  register as registerService,
  login as loginService,
  getProfile as getProfileService,
  updateProfile as updateProfileService,
  changePassword as changePasswordService,
  requestPasswordReset as requestPasswordResetService,
  resetPassword as resetPasswordService,
  refreshToken as refreshTokenService,
  type User,
  type registerResponse,
  type loginResponse,
  type profileResponse,
  type updateProfileResponse,
  type changePasswordResponse,
  type requestPasswordResetResponse,
  type resetPasswordResponse,
  type refreshTokenResponse,
} from "../services/authService";
import { setToken, removeToken } from "../utils/localStorage";

// Register Hook
export const useRegister = () => {
  const navigate = useNavigate();
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
      // Map UI display values to API values
      const roleMap: Record<string, string> = {
        "UG Student": "ug",
        "PG Student": "pg",
        "Alumni": "alumni",
        "Faculty": "faculty",
      };

      const payload = {
        name: data.fullName,
        email: data.email.toLowerCase().trim(),
        password: data.password,
        cmsId: parseInt(data.cmsId),
        role: roleMap[data.role] || data.role.toLowerCase(),
        ...(data.gender && { gender: data.gender.toLowerCase() }),
      };
      const response: registerResponse = await registerService(payload);
      if (response) {
        if (response.data?.token || response.data?.access_token) {
          setToken(response.data.token || response.data.access_token);
        }
        toast.success(response.message || "Registration successful!", {
          id: "registerSuccess",
        });
        reset();
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Registration failed";
        setError(errorMessage);
        toast.error(errorMessage, { id: "registerError" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    formState: { errors, isSubmitting: isLoading },
    onSubmit,
    reset,
    error,
    isLoading,
  };
};

// Login Hook
export const useLogin = () => {
  const navigate = useNavigate();
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
      const response: loginResponse = await loginService(data);
      if (response) {
        if (response.data?.token || response.data?.access_token) {
          setToken(response.data.token || response.data.access_token);
        }
        toast.success(response.message || "Login successful!", {
          id: "loginSuccess",
        });
        reset();
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Login failed";
        setError(errorMessage);
        toast.error(errorMessage, { id: "loginError" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    formState: { errors, isSubmitting: isLoading },
    onSubmit,
    reset,
    error,
    isLoading,
  };
};

// Logout Hook - Client-side only, no backend call needed
export const useLogout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const logout = () => {
    setIsLoading(true);
    try {
      removeToken();
      toast.success("Logged out successfully", { id: "logoutSuccess" });
      navigate("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", { id: "logoutError" });
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
};

// Get Profile Hook
export const useGetProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: profileResponse = await getProfileService();
      if (response) {
        setUser(response.data.user);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch profile";
        setError(errorMessage);
        toast.error(errorMessage, { id: "getProfileError" });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getProfile, user, isLoading, error };
};

// Update Profile Hook
export const useUpdateProfile = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    getValues,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
        ...(data.address && { address: data.address }),
        ...(data.profilePictureUrl && { profilePictureUrl: data.profilePictureUrl }),
        ...(data.bio && { bio: data.bio }),
        ...(data.gender !== undefined && { gender: data.gender }),
      };
      const response: updateProfileResponse = await updateProfileService(payload);
      if (response) {
        toast.success("Profile updated successfully!", {
          id: "updateProfileSuccess",
        });
        reset();
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Profile update failed";
        setError(errorMessage);
        toast.error(errorMessage, { id: "updateProfileError" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    formState: { errors, isSubmitting: isLoading, isDirty },
    onSubmit,
    reset,
    getValues,
    error,
    isLoading,
  };
};

// Change Password Hook
export const useChangePassword = (onSuccess?: () => void) => {
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
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };
      const response: changePasswordResponse =
        await changePasswordService(payload);
      if (response) {
        toast.success(response.message || "Password changed successfully!", {
          id: "changePasswordSuccess",
        });
        reset();
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Password change failed";
        setError(errorMessage);
        toast.error(errorMessage, { id: "changePasswordError" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    formState: { errors, isSubmitting: isLoading },
    onSubmit,
    reset,
    error,
    isLoading,
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
      const response: requestPasswordResetResponse =
        await requestPasswordResetService(data);
      if (response) {
        toast.success(
          response.message || "Password reset email sent successfully!",
          { id: "requestPasswordResetSuccess" }
        );
        reset();
        return { success: true, data: response };
      }
      return { success: false };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to request password reset";
        setError(errorMessage);
        toast.error(errorMessage, { id: "requestPasswordResetError" });
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    formState: { errors, isSubmitting: isLoading },
    onSubmit,
    reset,
    error,
    isLoading,
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

  const onSubmit = async (data: ResetPasswordFormData, token?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: resetPasswordResponse = await resetPasswordService({
        token: token || "",
        newPassword: data.password,
      });
      if (response) {
        toast.success(response.message || "Password reset successfully!", {
          id: "resetPasswordSuccess",
        });
        reset();
        return { success: true, data: response };
      }
      return { success: false };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Password reset failed";
        setError(errorMessage);
        toast.error(errorMessage, { id: "resetPasswordError" });
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isLoading },
    onSubmit,
    reset,
    error,
    isLoading,
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
      const response: refreshTokenResponse = await refreshTokenService();
      if (response) {
        if (response.data?.token || response.data?.access_token) {
          setToken(response.data.token || response.data.access_token);
        }
        toast.success(response.message || "Token refreshed successfully", {
          id: "refreshTokenSuccess",
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Token refresh failed";
        setError(errorMessage);
        toast.error(errorMessage, { id: "refreshTokenError" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { refreshToken, isLoading, error };
};
