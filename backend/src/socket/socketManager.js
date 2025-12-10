/**
 * Socket.IO instance manager
 * This file manages the global Socket.IO instance to avoid circular dependencies
 */

let ioInstance = null;

/**
 * Set the Socket.IO instance
 */
export const setIoInstance = (io) => {
  ioInstance = io;
};

/**
 * Get the Socket.IO instance
 */
export const getIoInstance = () => {
  return ioInstance;
};

