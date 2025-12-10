import { supabaseAdmin as supabase } from '../config/supabase.js';

/**
 * Get all available players (excluding those in active matches)
 */
export const getAvailablePlayers = async (excludeUserId = null) => {
  try {
    // First, get all users who are available
    let query = supabase
      .from('badminton_availability')
      .select(`
        *,
        user:users_metadata (
          id,
          name,
          email,
          profile_picture_url,
          cms_id,
          role,
          gender
        )
      `)
      .eq('is_available', true);

    if (excludeUserId) {
      query = query.neq('user_id', excludeUserId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting available players:', error);
      // Check if table doesn't exist
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.error('Badminton tables do not exist. Please run the migration: backend/database/migrations/badminton_module.sql');
      }
      return { success: false, players: [], error: error.message };
    }

    // Get all user IDs who are in active matches
    const { data: activeMatches, error: matchesError } = await supabase
      .from('badminton_matches')
      .select('team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id')
      .in('status', ['scheduled', 'in_progress']);

    if (matchesError) {
      console.error('Error getting active matches:', matchesError);
    }

    // Collect all user IDs in active matches
    const usersInMatches = new Set();
    if (activeMatches) {
      activeMatches.forEach(match => {
        if (match.team1_player1_id) usersInMatches.add(match.team1_player1_id);
        if (match.team1_player2_id) usersInMatches.add(match.team1_player2_id);
        if (match.team2_player1_id) usersInMatches.add(match.team2_player1_id);
        if (match.team2_player2_id) usersInMatches.add(match.team2_player2_id);
      });
    }

    // Filter out users who are in active matches
    const players = (data || [])
      .filter(item => item.user && !usersInMatches.has(item.user.id)) // Filter out null users and users in matches
      .map(item => ({
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
        avatar: item.user.profile_picture_url,
        cms_id: item.user.cms_id,
        role: item.user.role,
        gender: item.user.gender,
        initials: getInitials(item.user.name),
        available: true
      }));

    return { success: true, players };
  } catch (error) {
    console.error('Error in getAvailablePlayers:', error);
    return { success: false, players: [] };
  }
};

/**
 * Get user availability status
 */
export const getUserAvailability = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('badminton_availability')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user availability:', error);
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.error('Badminton tables do not exist. Please run the migration: backend/database/migrations/badminton_module.sql');
      }
      return { success: false, isAvailable: false, error: error.message };
    }

    return { success: true, isAvailable: data?.is_available || false };
  } catch (error) {
    console.error('Error in getUserAvailability:', error);
    return { success: false, isAvailable: false };
  }
};

/**
 * Set user availability
 */
export const setUserAvailability = async (userId, isAvailable) => {
  try {
    const { data, error } = await supabase
      .from('badminton_availability')
      .upsert({
        user_id: userId,
        is_available: isAvailable,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error setting user availability:', error);
      return { success: false };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in setUserAvailability:', error);
    return { success: false };
  }
};

/**
 * Get all courts
 */
export const getCourts = async () => {
  try {
    const { data, error } = await supabase
      .from('badminton_courts')
      .select('*')
      .order('court_number', { ascending: true });

    if (error) {
      console.error('Error getting courts:', error);
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.error('Badminton tables do not exist. Please run the migration: backend/database/migrations/badminton_module.sql');
      }
      return { success: false, courts: [], error: error.message };
    }

    return { success: true, courts: data || [] };
  } catch (error) {
    console.error('Error in getCourts:', error);
    return { success: false, courts: [] };
  }
};

/**
 * Update court status (admin only)
 */
export const updateCourtStatus = async (courtId, status) => {
  try {
    if (!['available', 'occupied', 'maintenance'].includes(status)) {
      return { success: false, error: 'Invalid status. Must be: available, occupied, or maintenance' };
    }

    const { data, error } = await supabase
      .from('badminton_courts')
      .update({ status })
      .eq('id', courtId)
      .select()
      .single();

    if (error) {
      console.error('Error updating court status:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Court not found' };
    }

    return { success: true, court: data };
  } catch (error) {
    console.error('Error in updateCourtStatus:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if court is available for a time slot
 */
export const checkCourtAvailability = async (courtId, startTime, endTime) => {
  try {
    const { data, error } = await supabase.rpc('check_court_availability', {
      p_court_id: courtId,
      p_start_time: startTime,
      p_end_time: endTime
    });

    if (error) {
      console.error('Error checking court availability:', error);
      return { success: false, isAvailable: false };
    }

    return { success: true, isAvailable: data };
  } catch (error) {
    // Fallback to manual check if RPC doesn't work
    try {
      const { data: matches, error: matchError } = await supabase
        .from('badminton_matches')
        .select('id')
        .eq('court_id', courtId)
        .in('status', ['scheduled', 'in_progress'])
        .lt('scheduled_start_time', endTime)
        .gt('scheduled_end_time', startTime);

      if (matchError) {
        console.error('Error in fallback court availability check:', matchError);
        return { success: false, isAvailable: false };
      }

      return { success: true, isAvailable: (matches || []).length === 0 };
    } catch (fallbackError) {
      console.error('Error in fallback check:', fallbackError);
      return { success: false, isAvailable: false };
    }
  }
};

/**
 * Create a match
 */
export const createMatch = async (matchData) => {
  try {
    const {
      courtId,
      team1Player1Id,
      team1Player2Id,
      team2Player1Id,
      team2Player2Id,
      matchMode,
      createdBy
    } = matchData;

    // Calculate scheduled times (30 minutes from now)
    const scheduledStartTime = new Date();
    const scheduledEndTime = new Date(scheduledStartTime.getTime() + 30 * 60 * 1000);

    const { data, error } = await supabase
      .from('badminton_matches')
      .insert({
        court_id: courtId,
        team1_player1_id: team1Player1Id,
        team1_player2_id: team1Player2Id || null,
        team2_player1_id: team2Player1Id,
        team2_player2_id: team2Player2Id || null,
        match_mode: matchMode,
        status: 'scheduled',
        scheduled_start_time: scheduledStartTime.toISOString(),
        scheduled_end_time: scheduledEndTime.toISOString(),
        created_by: createdBy
      })
      .select(`
        *,
        court:badminton_courts (*),
        team1_player1:users_metadata!team1_player1_id (id, name, email, profile_picture_url, cms_id, role, gender),
        team1_player2:users_metadata!team1_player2_id (id, name, email, profile_picture_url, cms_id, role, gender),
        team2_player1:users_metadata!team2_player1_id (id, name, email, profile_picture_url, cms_id, role, gender),
        team2_player2:users_metadata!team2_player2_id (id, name, email, profile_picture_url, cms_id, role, gender)
      `)
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return { success: false, error: error.message };
    }

    // Update court status to occupied
    await supabase
      .from('badminton_courts')
      .update({ status: 'occupied' })
      .eq('id', courtId);

    // Transform player data
    const transformed = { ...data };
    if (data.team1_player1) {
      transformed.team1_player1 = {
        id: data.team1_player1.id,
        name: data.team1_player1.name,
        email: data.team1_player1.email,
        avatar: data.team1_player1.profile_picture_url,
        cms_id: data.team1_player1.cms_id || 0,
        role: data.team1_player1.role || '',
        gender: data.team1_player1.gender,
        initials: getInitials(data.team1_player1.name),
        available: true
      };
    }
    if (data.team1_player2) {
      transformed.team1_player2 = {
        id: data.team1_player2.id,
        name: data.team1_player2.name,
        email: data.team1_player2.email,
        avatar: data.team1_player2.profile_picture_url,
        cms_id: data.team1_player2.cms_id || 0,
        role: data.team1_player2.role || '',
        gender: data.team1_player2.gender,
        initials: getInitials(data.team1_player2.name),
        available: true
      };
    }
    if (data.team2_player1) {
      transformed.team2_player1 = {
        id: data.team2_player1.id,
        name: data.team2_player1.name,
        email: data.team2_player1.email,
        avatar: data.team2_player1.profile_picture_url,
        cms_id: data.team2_player1.cms_id || 0,
        role: data.team2_player1.role || '',
        gender: data.team2_player1.gender,
        initials: getInitials(data.team2_player1.name),
        available: true
      };
    }
    if (data.team2_player2) {
      transformed.team2_player2 = {
        id: data.team2_player2.id,
        name: data.team2_player2.name,
        email: data.team2_player2.email,
        avatar: data.team2_player2.profile_picture_url,
        cms_id: data.team2_player2.cms_id || 0,
        role: data.team2_player2.role || '',
        gender: data.team2_player2.gender,
        initials: getInitials(data.team2_player2.name),
        available: true
      };
    }

    return { success: true, match: transformed };
  } catch (error) {
    console.error('Error in createMatch:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Start a match
 */
export const startMatch = async (matchId) => {
  try {
    const { data, error } = await supabase
      .from('badminton_matches')
      .update({
        status: 'in_progress',
        actual_start_time: new Date().toISOString()
      })
      .eq('id', matchId)
      .select(`
        *,
        court:badminton_courts (*),
        team1_player1:users_metadata!team1_player1_id (id, name, email, profile_picture_url, cms_id, role, gender),
        team1_player2:users_metadata!team1_player2_id (id, name, email, profile_picture_url, cms_id, role, gender),
        team2_player1:users_metadata!team2_player1_id (id, name, email, profile_picture_url, cms_id, role, gender),
        team2_player2:users_metadata!team2_player2_id (id, name, email, profile_picture_url, cms_id, role, gender)
      `)
      .single();

    if (error) {
      console.error('Error starting match:', error);
      return { success: false, error: error.message };
    }

    // Transform player data
    const transformed = { ...data };
    if (data.team1_player1) {
      transformed.team1_player1 = {
        id: data.team1_player1.id,
        name: data.team1_player1.name,
        email: data.team1_player1.email,
        avatar: data.team1_player1.profile_picture_url,
        cms_id: data.team1_player1.cms_id || 0,
        role: data.team1_player1.role || '',
        gender: data.team1_player1.gender,
        initials: getInitials(data.team1_player1.name),
        available: true
      };
    }
    if (data.team1_player2) {
      transformed.team1_player2 = {
        id: data.team1_player2.id,
        name: data.team1_player2.name,
        email: data.team1_player2.email,
        avatar: data.team1_player2.profile_picture_url,
        cms_id: data.team1_player2.cms_id || 0,
        role: data.team1_player2.role || '',
        gender: data.team1_player2.gender,
        initials: getInitials(data.team1_player2.name),
        available: true
      };
    }
    if (data.team2_player1) {
      transformed.team2_player1 = {
        id: data.team2_player1.id,
        name: data.team2_player1.name,
        email: data.team2_player1.email,
        avatar: data.team2_player1.profile_picture_url,
        cms_id: data.team2_player1.cms_id || 0,
        role: data.team2_player1.role || '',
        gender: data.team2_player1.gender,
        initials: getInitials(data.team2_player1.name),
        available: true
      };
    }
    if (data.team2_player2) {
      transformed.team2_player2 = {
        id: data.team2_player2.id,
        name: data.team2_player2.name,
        email: data.team2_player2.email,
        avatar: data.team2_player2.profile_picture_url,
        cms_id: data.team2_player2.cms_id || 0,
        role: data.team2_player2.role || '',
        gender: data.team2_player2.gender,
        initials: getInitials(data.team2_player2.name),
        available: true
      };
    }

    return { success: true, match: transformed };
  } catch (error) {
    console.error('Error in startMatch:', error);
    return { success: false, error: error.message };
  }
};

/**
 * End a match
 */
export const endMatch = async (matchId) => {
  try {
    // Get match to find court_id
    const { data: match, error: matchError } = await supabase
      .from('badminton_matches')
      .select('court_id')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return { success: false, error: 'Match not found' };
    }

    // Update match status
    const { data, error } = await supabase
      .from('badminton_matches')
      .update({
        status: 'completed',
        actual_end_time: new Date().toISOString()
      })
      .eq('id', matchId)
      .select(`
        *,
        court:badminton_courts (*)
      `)
      .single();

    if (error) {
      console.error('Error ending match:', error);
      return { success: false, error: error.message };
    }

    // Check if court has any other active matches
    const { data: activeMatches, error: activeError } = await supabase
      .from('badminton_matches')
      .select('id')
      .eq('court_id', match.court_id)
      .in('status', ['scheduled', 'in_progress'])
      .limit(1);

    // If no active matches, set court to available
    if (!activeError && (!activeMatches || activeMatches.length === 0)) {
      await supabase
        .from('badminton_courts')
        .update({ status: 'available' })
        .eq('id', match.court_id);
    }

    return { success: true, match: data };
  } catch (error) {
    console.error('Error in endMatch:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get active matches for a user
 */
export const getUserActiveMatches = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('badminton_matches')
      .select(`
        *,
        court:badminton_courts (*),
        team1_player1:users_metadata!team1_player1_id (id, name, email, profile_picture_url, cms_id, role, gender),
        team1_player2:users_metadata!team1_player2_id (id, name, email, profile_picture_url, cms_id, role, gender),
        team2_player1:users_metadata!team2_player1_id (id, name, email, profile_picture_url, cms_id, role, gender),
        team2_player2:users_metadata!team2_player2_id (id, name, email, profile_picture_url, cms_id, role, gender)
      `)
      .in('status', ['scheduled', 'in_progress'])
      .or(`team1_player1_id.eq.${userId},team1_player2_id.eq.${userId},team2_player1_id.eq.${userId},team2_player2_id.eq.${userId}`)
      .order('scheduled_start_time', { ascending: true });

    if (error) {
      console.error('Error getting user active matches:', error);
      return { success: false, matches: [] };
    }

    // Transform the data to match frontend expectations
    const transformedMatches = await Promise.all((data || []).map(async (match) => {
      const transformed = { ...match };
      
      // Transform players to match Player interface, with fallback to fetch separately
      if (match.team1_player1_id) {
        if (match.team1_player1 && typeof match.team1_player1 === 'object') {
          transformed.team1_player1 = {
            id: match.team1_player1.id,
            name: match.team1_player1.name,
            email: match.team1_player1.email,
            avatar: match.team1_player1.profile_picture_url,
            cms_id: match.team1_player1.cms_id || 0,
            role: match.team1_player1.role || '',
            gender: match.team1_player1.gender,
            initials: getInitials(match.team1_player1.name),
            available: true
          };
        } else {
          // Fallback: fetch player data separately
          transformed.team1_player1 = await fetchPlayerData(match.team1_player1_id);
        }
      }
      
      if (match.team1_player2_id) {
        if (match.team1_player2 && typeof match.team1_player2 === 'object') {
          transformed.team1_player2 = {
            id: match.team1_player2.id,
            name: match.team1_player2.name,
            email: match.team1_player2.email,
            avatar: match.team1_player2.profile_picture_url,
            cms_id: match.team1_player2.cms_id || 0,
            role: match.team1_player2.role || '',
            gender: match.team1_player2.gender,
            initials: getInitials(match.team1_player2.name),
            available: true
          };
        } else {
          transformed.team1_player2 = await fetchPlayerData(match.team1_player2_id);
        }
      }
      
      if (match.team2_player1_id) {
        if (match.team2_player1 && typeof match.team2_player1 === 'object') {
          transformed.team2_player1 = {
            id: match.team2_player1.id,
            name: match.team2_player1.name,
            email: match.team2_player1.email,
            avatar: match.team2_player1.profile_picture_url,
            cms_id: match.team2_player1.cms_id || 0,
            role: match.team2_player1.role || '',
            gender: match.team2_player1.gender,
            initials: getInitials(match.team2_player1.name),
            available: true
          };
        } else {
          transformed.team2_player1 = await fetchPlayerData(match.team2_player1_id);
        }
      }
      
      if (match.team2_player2_id) {
        if (match.team2_player2 && typeof match.team2_player2 === 'object') {
          transformed.team2_player2 = {
            id: match.team2_player2.id,
            name: match.team2_player2.name,
            email: match.team2_player2.email,
            avatar: match.team2_player2.profile_picture_url,
            cms_id: match.team2_player2.cms_id || 0,
            role: match.team2_player2.role || '',
            gender: match.team2_player2.gender,
            initials: getInitials(match.team2_player2.name),
            available: true
          };
        } else {
          transformed.team2_player2 = await fetchPlayerData(match.team2_player2_id);
        }
      }
      
      return transformed;
    }));

    return { success: true, matches: transformedMatches };
  } catch (error) {
    console.error('Error in getUserActiveMatches:', error);
    return { success: false, matches: [] };
  }
};

/**
 * Get available courts at a specific time
 */
export const getAvailableCourtsAtTime = async (startTime, endTime) => {
  try {
    const { data: courts, error: courtsError } = await supabase
      .from('badminton_courts')
      .select('*')
      .eq('status', 'available')
      .order('court_number', { ascending: true });

    if (courtsError) {
      return { success: false, courts: [] };
    }

    const availableCourts = [];
    for (const court of courts || []) {
      const availability = await checkCourtAvailability(court.id, startTime, endTime);
      if (availability.success && availability.isAvailable) {
        availableCourts.push(court);
      }
    }

    return { success: true, courts: availableCourts };
  } catch (error) {
    console.error('Error in getAvailableCourtsAtTime:', error);
    return { success: false, courts: [] };
  }
};

/**
 * Helper function to get initials from name
 */
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Helper function to fetch and transform player data
 */
async function fetchPlayerData(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('users_metadata')
      .select('id, name, email, profile_picture_url, cms_id, role, gender')
      .eq('id', userId)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.profile_picture_url,
      cms_id: data.cms_id || 0,
      role: data.role || '',
      gender: data.gender,
      initials: getInitials(data.name),
      available: true
    };
  } catch (error) {
    console.error('Error fetching player data:', error);
    return null;
  }
}

