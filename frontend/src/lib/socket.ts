import { io, Socket } from 'socket.io-client';
import { getToken } from '@/utils/localStorage';

// Get API URL from axios instance or use default
const getApiBaseUrl = () => {
  // Try to get from environment variable (should be base URL without /api)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    // Remove /api if present
    return envUrl.replace('/api', '');
  }
  
  // Default to localhost
  return 'http://localhost:3000';
};

const SOCKET_URL = getApiBaseUrl();

let socket: Socket | null = null;

/**
 * Initialize Socket.IO connection
 */
export const initializeSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const token = getToken();

  socket = io(SOCKET_URL, {
    auth: {
      token: token || ''
    },
    extraHeaders: token ? {
      Authorization: `Bearer ${token}`
    } : {},
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => {
  if (!socket || !socket.connected) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Reconnect socket with new token
 */
export const reconnectSocket = () => {
  disconnectSocket();
  return initializeSocket();
};

