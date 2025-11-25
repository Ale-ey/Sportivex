import { getToken } from './localStorage';

/**
 * Decode JWT token to get payload
 * Note: This only decodes the token, it does NOT verify the signature
 * For production, always verify tokens on the backend
 */
export const decodeJWT = (token: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Get current user ID from JWT token
 */
export const getCurrentUserId = (): string | null => {
  const token = getToken();
  if (!token) {
    return null;
  }
  
  const decoded = decodeJWT(token);
  return decoded?.id || null;
};

