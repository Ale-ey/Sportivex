import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { supabaseAdmin as supabase } from '../config/supabase.js';
import { setIoInstance, getIoInstance } from './socketManager.js';

/**
 * Initialize Socket.IO server with authentication
 */
export const initializeSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sportivex-git-dev-ale-eys-projects.vercel.app"
      ],
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user exists
      const { data: user, error } = await supabase
        .from('users_metadata')
        .select('id, name, email')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = decoded.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.user.name})`);
    
    // Join user's personal room for targeted updates
    socket.join(`user:${socket.userId}`);
    
    // Join badminton room for general updates
    socket.join('badminton');

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });

    // Handle availability updates
    socket.on('availability:update', async (data) => {
      // Broadcast availability change to all users in badminton room
      io.to('badminton').emit('availability:changed', {
        userId: socket.userId,
        isAvailable: data.isAvailable,
        timestamp: new Date().toISOString()
      });
    });

    // Handle match updates
    socket.on('match:update', (data) => {
      // Broadcast match update to all users in badminton room
      io.to('badminton').emit('match:changed', {
        matchId: data.matchId,
        status: data.status,
        timestamp: new Date().toISOString()
      });
    });
  });

  // Store io instance globally
  setIoInstance(io);

  return io;
};

/**
 * Emit availability change event
 */
export const emitAvailabilityChange = (userId, isAvailable) => {
  const io = getIoInstance();
  if (io) {
    io.to('badminton').emit('availability:changed', {
      userId,
      isAvailable,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Emit match change event
 */
export const emitMatchChange = (matchData) => {
  const io = getIoInstance();
  if (io) {
    // Get player IDs involved in the match
    const playerIds = [
      matchData.team1_player1_id,
      matchData.team1_player2_id,
      matchData.team2_player1_id,
      matchData.team2_player2_id
    ].filter(Boolean);

    // Emit to all users in badminton room (for general updates)
    io.to('badminton').emit('match:changed', {
      matchId: matchData.id,
      status: matchData.status,
      courtId: matchData.court_id,
      team1Player1Id: matchData.team1_player1_id,
      team1Player2Id: matchData.team1_player2_id,
      team2Player1Id: matchData.team2_player1_id,
      team2Player2Id: matchData.team2_player2_id,
      timestamp: new Date().toISOString()
    });

    // Emit detailed match update to specific users involved in the match
    // This ensures they get the full match data immediately
    playerIds.forEach(playerId => {
      io.to(`user:${playerId}`).emit('match:updated', {
        match: matchData,
        timestamp: new Date().toISOString()
      });
    });

    // Also emit to badminton room with full match data for involved players
    // This is a fallback in case user-specific rooms don't work
    io.to('badminton').emit('match:updated', {
      match: matchData,
      timestamp: new Date().toISOString()
    });
  }
};

