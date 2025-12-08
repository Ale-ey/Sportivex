import {
  getLeagues,
  getLeagueById,
  createLeague,
  updateLeague,
  deleteLeague,
} from '../services/leagueService.js';

/**
 * Get all leagues
 */
export const getLeaguesController = async (req, res) => {
  try {
    const result = await getLeagues();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leagues',
        details: result.error?.includes('does not exist') ? 'Database table not found. Please run the migration.' : undefined
      });
    }

    res.json({
      success: true,
      data: {
        leagues: result.leagues,
        count: result.leagues.length
      }
    });
  } catch (error) {
    console.error('Error in getLeaguesController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get league by ID
 */
export const getLeagueByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getLeagueById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || 'League not found'
      });
    }

    res.json({
      success: true,
      data: {
        league: result.league
      }
    });
  } catch (error) {
    console.error('Error in getLeagueByIdController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create league (admin only)
 */
export const createLeagueController = async (req, res) => {
  try {
    const user = req.user;
    const { name, description, sport_type, start_date, end_date, registration_deadline, max_participants, prize, status } = req.body;

    // Validation
    if (!name || !sport_type || !start_date || !end_date || !registration_deadline) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, sport_type, start_date, end_date, registration_deadline'
      });
    }

    const result = await createLeague(
      {
        name,
        description,
        sport_type,
        start_date,
        end_date,
        registration_deadline,
        max_participants,
        prize,
        status,
      },
      user.id
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to create league'
      });
    }

    res.status(201).json({
      success: true,
      message: 'League created successfully',
      data: {
        league: result.league
      }
    });
  } catch (error) {
    console.error('Error in createLeagueController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update league (admin only)
 */
export const updateLeagueController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sport_type, start_date, end_date, registration_deadline, max_participants, prize, status } = req.body;

    const result = await updateLeague(id, {
      name,
      description,
      sport_type,
      start_date,
      end_date,
      registration_deadline,
      max_participants,
      prize,
      status,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to update league'
      });
    }

    res.json({
      success: true,
      message: 'League updated successfully',
      data: {
        league: result.league
      }
    });
  } catch (error) {
    console.error('Error in updateLeagueController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete league (admin only)
 */
export const deleteLeagueController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteLeague(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to delete league'
      });
    }

    res.json({
      success: true,
      message: 'League deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteLeagueController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



