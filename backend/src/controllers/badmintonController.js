import { supabaseAdmin as supabase } from '../config/supabase.js';
import {
  getAvailablePlayers,
  getUserAvailability,
  setUserAvailability,
  getCourts,
  checkCourtAvailability,
  createMatch,
  startMatch,
  endMatch,
  getUserActiveMatches,
  getAvailableCourtsAtTime
} from '../services/badmintonService.js';
import { emitAvailabilityChange, emitMatchChange } from '../socket/socketServer.js';

/**
 * Get all available players
 */
export const getAvailablePlayersController = async (req, res) => {
  try {
    const user = req.user;
    const result = await getAvailablePlayers(user.id);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to fetch available players',
        details: result.error?.includes('does not exist') ? 'Database tables not found. Please run the migration.' : undefined
      });
    }

    res.json({
      success: true,
      players: result.players
    });
  } catch (error) {
    console.error('Error in getAvailablePlayersController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get current user's availability status
 */
export const getMyAvailabilityController = async (req, res) => {
  try {
    const user = req.user;
    const result = await getUserAvailability(user.id);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch availability status'
      });
    }

    res.json({
      success: true,
      isAvailable: result.isAvailable
    });
  } catch (error) {
    console.error('Error in getMyAvailabilityController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Toggle user availability
 */
export const toggleAvailabilityController = async (req, res) => {
  try {
    const user = req.user;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean'
      });
    }

    const result = await setUserAvailability(user.id, isAvailable);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update availability'
      });
    }

    // Emit real-time availability change
    emitAvailabilityChange(user.id, isAvailable);

    res.json({
      success: true,
      message: isAvailable ? 'You are now available' : 'You are now unavailable',
      isAvailable
    });
  } catch (error) {
    console.error('Error in toggleAvailabilityController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all courts
 */
export const getCourtsController = async (req, res) => {
  try {
    const result = await getCourts();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch courts'
      });
    }

    res.json({
      success: true,
      courts: result.courts
    });
  } catch (error) {
    console.error('Error in getCourtsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create a match
 */
export const createMatchController = async (req, res) => {
  try {
    const user = req.user;
    const {
      courtId,
      team1Player1Id,
      team1Player2Id,
      team2Player1Id,
      team2Player2Id,
      matchMode
    } = req.body;

    // Validation
    if (!courtId || !team1Player1Id || !team2Player1Id || !matchMode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courtId, team1Player1Id, team2Player1Id, matchMode'
      });
    }

    if (!['1v1', '2v2'].includes(matchMode)) {
      return res.status(400).json({
        success: false,
        message: 'matchMode must be either "1v1" or "2v2"'
      });
    }

    if (matchMode === '2v2' && (!team1Player2Id || !team2Player2Id)) {
      return res.status(400).json({
        success: false,
        message: 'Both teams must have 2 players for 2v2 mode'
      });
    }

    // Check if court is available
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
    const availability = await checkCourtAvailability(courtId, startTime.toISOString(), endTime.toISOString());

    if (!availability.success || !availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Court is not available at this time'
      });
    }

    // Create match
    const result = await createMatch({
      courtId,
      team1Player1Id,
      team1Player2Id: matchMode === '2v2' ? team1Player2Id : null,
      team2Player1Id,
      team2Player2Id: matchMode === '2v2' ? team2Player2Id : null,
      matchMode,
      createdBy: user.id
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to create match'
      });
    }

    // Emit real-time match creation event
    emitMatchChange(result.match);

    res.status(201).json({
      success: true,
      message: 'Match created successfully',
      match: result.match
    });
  } catch (error) {
    console.error('Error in createMatchController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Start a match
 */
export const startMatchController = async (req, res) => {
  try {
    const { matchId } = req.params;

    if (!matchId) {
      return res.status(400).json({
        success: false,
        message: 'matchId is required'
      });
    }

    const result = await startMatch(matchId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to start match'
      });
    }

    // Emit real-time match start event
    emitMatchChange(result.match);

    res.json({
      success: true,
      message: 'Match started',
      match: result.match
    });
  } catch (error) {
    console.error('Error in startMatchController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * End a match
 */
export const endMatchController = async (req, res) => {
  try {
    const { matchId } = req.params;

    if (!matchId) {
      return res.status(400).json({
        success: false,
        message: 'matchId is required'
      });
    }

    const result = await endMatch(matchId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Failed to end match'
      });
    }

    // Emit real-time match end event
    emitMatchChange(result.match);

    res.json({
      success: true,
      message: 'Match ended',
      match: result.match
    });
  } catch (error) {
    console.error('Error in endMatchController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user's active matches
 */
export const getMyMatchesController = async (req, res) => {
  try {
    const user = req.user;
    const result = await getUserActiveMatches(user.id);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch matches'
      });
    }

    res.json({
      success: true,
      matches: result.matches
    });
  } catch (error) {
    console.error('Error in getMyMatchesController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Find match - auto-select random available player
 */
export const findMatchController = async (req, res) => {
  try {
    const user = req.user;
    const { matchMode, teamNumber } = req.body;

    if (!matchMode || !['1v1', '2v2'].includes(matchMode)) {
      return res.status(400).json({
        success: false,
        message: 'matchMode must be either "1v1" or "2v2"'
      });
    }

    if (!teamNumber || ![1, 2].includes(teamNumber)) {
      return res.status(400).json({
        success: false,
        message: 'teamNumber must be either 1 or 2'
      });
    }

    // Get available players (excluding current user)
    const playersResult = await getAvailablePlayers(user.id);

    if (!playersResult.success || playersResult.players.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No available players found'
      });
    }

    // Randomly select a player
    const randomIndex = Math.floor(Math.random() * playersResult.players.length);
    const selectedPlayer = playersResult.players[randomIndex];

    res.json({
      success: true,
      player: selectedPlayer
    });
  } catch (error) {
    console.error('Error in findMatchController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get available courts at current time
 */
export const getAvailableCourtsController = async (req, res) => {
  try {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const result = await getAvailableCourtsAtTime(startTime.toISOString(), endTime.toISOString());

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch available courts'
      });
    }

    res.json({
      success: true,
      courts: result.courts
    });
  } catch (error) {
    console.error('Error in getAvailableCourtsController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

