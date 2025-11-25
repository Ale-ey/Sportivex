import { getSocket, initializeSocket, disconnectSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export type AvailabilityChangedEvent = {
  userId: string;
  isAvailable: boolean;
  timestamp: string;
};

export type MatchChangedEvent = {
  matchId: string;
  status: string;
  courtId?: string;
  team1Player1Id?: string;
  team1Player2Id?: string;
  team2Player1Id?: string;
  team2Player2Id?: string;
  timestamp: string;
};

export type MatchUpdatedEvent = {
  match: any;
  timestamp: string;
};

type EventCallbacks = {
  onAvailabilityChanged?: (data: AvailabilityChangedEvent) => void;
  onMatchChanged?: (data: MatchChangedEvent) => void;
  onMatchUpdated?: (data: MatchUpdatedEvent) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
};

/**
 * Socket service for managing WebSocket connections and events
 */
class SocketService {
  private socket: Socket | null = null;
  private callbacks: EventCallbacks = {};
  private isInitialized = false;

  /**
   * Initialize socket connection
   */
  initialize() {
    if (this.isInitialized && this.socket?.connected) {
      return this.socket;
    }

    this.socket = initializeSocket();
    this.isInitialized = true;
    this.setupEventListeners();
    
    return this.socket;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.callbacks.onDisconnect?.(reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.callbacks.onError?.(error);
    });

    // Badminton-specific events
    this.socket.on('availability:changed', (data: AvailabilityChangedEvent) => {
      this.callbacks.onAvailabilityChanged?.(data);
    });

    this.socket.on('match:changed', (data: MatchChangedEvent) => {
      this.callbacks.onMatchChanged?.(data);
    });

    this.socket.on('match:updated', (data: MatchUpdatedEvent) => {
      this.callbacks.onMatchUpdated?.(data);
    });
  }

  /**
   * Register event callbacks
   */
  on(callbacks: EventCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
    
    // Ensure socket is initialized
    if (!this.socket) {
      this.initialize();
    } else if (this.socket.connected) {
      // Re-setup listeners with new callbacks
      this.setupEventListeners();
    }
  }

  /**
   * Remove event callbacks
   */
  off() {
    if (this.socket) {
      this.socket.off('availability:changed');
      this.socket.off('match:changed');
      this.socket.off('match:updated');
      this.socket.off('connect');
      this.socket.off('disconnect');
      this.socket.off('connect_error');
    }
    this.callbacks = {};
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    if (!this.socket || !this.socket.connected) {
      return this.initialize();
    }
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.off();
      disconnectSocket();
      this.socket = null;
      this.isInitialized = false;
    }
  }

  /**
   * Reconnect socket
   */
  reconnect() {
    this.disconnect();
    return this.initialize();
  }
}

// Export singleton instance
export const socketService = new SocketService();

