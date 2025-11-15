import { END_POINT } from '@/lib/apiURL';
import apiInvoker from '@/lib/apiInvoker';

export interface registerPayload {
  name: string;
  email: string;
  password: string;
  cmsId: number;
  role: string;
  gender?: string;
}

export interface registerResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      cmsId: string;
      role: string;
      email: string;
      emailConfirmed: boolean;
      institution: string;
    };
    access_token: string;
    token: string;
    expires_in: string;
  };
}

export const register = (payload: registerPayload) => {
  return apiInvoker<registerResponse>(END_POINT.auth.register, "POST", payload);
}

export interface loginPayload {
  email: string;
  password: string;
}

export interface loginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      cmsId: string;
      role: string;
      email: string;
      emailConfirmed: boolean;
      institution: string;
    };
    access_token: string;
    token: string;
    expires_in: string;
  };
}

export const login = (payload: loginPayload) => {
  return apiInvoker<loginResponse>(END_POINT.auth.login, "POST", payload);
}

// Logout is handled client-side only - no backend call needed

export interface User {
  id: string;
  name: string;
  cmsId: string;
  role: string;
  email: string;
  institution?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  profilePictureUrl?: string;
  bio?: string;
  emailConfirmed?: boolean;
  registrationDate?: string;
}

export interface profileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const getProfile = () => {
  return apiInvoker<profileResponse>(END_POINT.auth.profile, "GET");
}

export interface updateProfilePayload {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  profilePictureUrl?: string;
  bio?: string;
}

export interface updateProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const updateProfile = (payload: updateProfilePayload) => {
  return apiInvoker<updateProfileResponse>(END_POINT.auth.updateProfile, "PUT", payload);
}

export interface changePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface changePasswordResponse {
  success: boolean;
  message: string;
}

export const changePassword = (payload: changePasswordPayload) => {
  return apiInvoker<changePasswordResponse>(END_POINT.auth.changePassword, "POST", payload);
}

export interface requestPasswordResetPayload {
  email: string;
}

export interface requestPasswordResetResponse {
  success: boolean;
  message: string;
}

export const requestPasswordReset = (payload: requestPasswordResetPayload) => {
  return apiInvoker<requestPasswordResetResponse>(END_POINT.auth.requestPasswordReset, "POST", payload);
}

export interface resetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface resetPasswordResponse {
  success: boolean;
  message: string;
}

export const resetPassword = (payload: resetPasswordPayload) => {
  return apiInvoker<resetPasswordResponse>(END_POINT.auth.resetPassword, "POST", payload);
}

export interface refreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      cmsId: string;
    };
    access_token: string;
    token: string;
    expires_in: string;
  };
}

export const refreshToken = () => {
  return apiInvoker<refreshTokenResponse>(END_POINT.auth.refreshToken, "POST");
}

