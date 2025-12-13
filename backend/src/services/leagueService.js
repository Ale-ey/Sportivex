import { supabaseAdmin as supabase } from '../config/supabase.js';

/**
 * Calculate league status based on dates
 * @param {Object} league - League object with start_date, end_date, registration_deadline, registration_enabled
 * @returns {string} - Status: 'upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'
 */
const calculateLeagueStatus = (league) => {
  // Don't change cancelled status
  if (league.status === 'cancelled') {
    return 'cancelled';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(league.start_date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = league.end_date ? new Date(league.end_date) : null;
  if (endDate) {
    endDate.setHours(23, 59, 59, 999); // End of day
  }
  
  const registrationDeadline = league.registration_deadline ? new Date(league.registration_deadline) : null;
  if (registrationDeadline) {
    registrationDeadline.setHours(23, 59, 59, 999); // End of day
  }

  // If start date is in the future
  if (startDate > today) {
    // Check if registration is open
    if (league.registration_enabled && registrationDeadline && today <= registrationDeadline) {
      return 'registration_open';
    }
    return 'upcoming';
  }
  
  // If start date is today or in the past
  if (startDate <= today) {
    // If end date exists and is in the past, league is completed
    if (endDate && endDate < today) {
      return 'completed';
    }
    // Otherwise, league is in progress
    return 'in_progress';
  }

  // Default fallback
  return 'upcoming';
};

/**
 * Update league status based on dates (auto-update)
 * @param {string} leagueId - League ID
 * @returns {Promise<Object>} - Result object
 */
const updateLeagueStatus = async (leagueId) => {
  try {
    // Get current league data
    const { data: league, error: fetchError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (fetchError || !league) {
      return { success: false, error: 'League not found' };
    }

    // Calculate new status
    const newStatus = calculateLeagueStatus(league);

    // Only update if status has changed
    if (league.status !== newStatus) {
      const { error: updateError } = await supabase
        .from('leagues')
        .update({ status: newStatus })
        .eq('id', leagueId);

      if (updateError) {
        console.error('Error updating league status:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, oldStatus: league.status, newStatus };
    }

    return { success: true, status: league.status, unchanged: true };
  } catch (error) {
    console.error('Error in updateLeagueStatus:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update all leagues statuses based on dates
 * @returns {Promise<Object>} - Result object
 */
const updateAllLeaguesStatus = async () => {
  try {
    // Get all non-cancelled leagues
    const { data: leagues, error: fetchError } = await supabase
      .from('leagues')
      .select('id, start_date, end_date, registration_deadline, registration_enabled, status')
      .neq('status', 'cancelled');

    if (fetchError) {
      console.error('Error fetching leagues for status update:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!leagues || leagues.length === 0) {
      return { success: true, updated: 0 };
    }

    let updatedCount = 0;
    const updates = [];

    // Calculate new status for each league
    for (const league of leagues) {
      const newStatus = calculateLeagueStatus(league);
      if (league.status !== newStatus) {
        updates.push({
          id: league.id,
          status: newStatus
        });
        updatedCount++;
      }
    }

    // Batch update all leagues that need status changes
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('leagues')
          .update({ status: update.status })
          .eq('id', update.id);

        if (updateError) {
          console.error(`Error updating league ${update.id}:`, updateError);
        }
      }
    }

    return { success: true, updated: updatedCount, total: leagues.length };
  } catch (error) {
    console.error('Error in updateAllLeaguesStatus:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all leagues (with auto-updated statuses and participant counts)
 */
export const getLeagues = async () => {
  try {
    // First, update all league statuses based on dates
    await updateAllLeaguesStatus();

    // Then fetch all leagues
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error getting leagues:', error);
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.error('Leagues table does not exist. Please run the migration: backend/database/migrations/leagues_module.sql');
      }
      return { success: false, leagues: [], error: error.message };
    }

    // Get participant counts for each league
    const leaguesWithCounts = await Promise.all(
      (data || []).map(async (league) => {
        // Count confirmed and registered participants
        const { count } = await supabase
          .from('league_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', league.id)
          .in('status', ['registered', 'confirmed']);

        return {
          ...league,
          participant_count: count || 0
        };
      })
    );

    return { success: true, leagues: leaguesWithCounts };
  } catch (error) {
    console.error('Error in getLeagues:', error);
    return { success: false, leagues: [] };
  }
};

/**
 * Get league by ID (with auto-updated status and participant count)
 */
export const getLeagueById = async (id) => {
  try {
    // First, update this league's status based on dates
    await updateLeagueStatus(id);

    // Then fetch the league
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting league:', error);
      return { success: false, league: null, error: error.message };
    }

    // Get participant count
    const { count } = await supabase
      .from('league_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('league_id', id)
      .in('status', ['registered', 'confirmed']);

    const leagueWithCount = {
      ...data,
      participant_count: count || 0
    };

    return { success: true, league: leagueWithCount };
  } catch (error) {
    console.error('Error in getLeagueById:', error);
    return { success: false, league: null };
  }
};

/**
 * Create league
 */
export const createLeague = async (leagueData, createdBy) => {
  try {
    const { data, error } = await supabase
      .from('leagues')
      .insert([
        {
          name: leagueData.name,
          description: leagueData.description || null,
          sport_type: leagueData.sport_type,
          start_date: leagueData.start_date,
          end_date: leagueData.end_date,
          registration_deadline: leagueData.registration_deadline,
          max_participants: leagueData.max_participants || null,
          prize: leagueData.prize || null,
          registration_fee: leagueData.registration_fee !== undefined ? leagueData.registration_fee : 0.00,
          status: leagueData.status || 'upcoming',
          created_by: createdBy,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating league:', error);
      return { success: false, league: null, error: error.message };
    }

    return { success: true, league: data };
  } catch (error) {
    console.error('Error in createLeague:', error);
    return { success: false, league: null, error: error.message };
  }
};

/**
 * Update league
 */
export const updateLeague = async (id, leagueData) => {
  try {
    const updateData = {};
    if (leagueData.name !== undefined) updateData.name = leagueData.name;
    if (leagueData.description !== undefined) updateData.description = leagueData.description;
    if (leagueData.sport_type !== undefined) updateData.sport_type = leagueData.sport_type;
    if (leagueData.start_date !== undefined) updateData.start_date = leagueData.start_date;
    if (leagueData.end_date !== undefined) updateData.end_date = leagueData.end_date;
    if (leagueData.registration_deadline !== undefined) updateData.registration_deadline = leagueData.registration_deadline;
    if (leagueData.max_participants !== undefined) updateData.max_participants = leagueData.max_participants;
    if (leagueData.prize !== undefined) updateData.prize = leagueData.prize;
    if (leagueData.registration_fee !== undefined) updateData.registration_fee = leagueData.registration_fee;
    if (leagueData.status !== undefined) updateData.status = leagueData.status;

    const { data, error } = await supabase
      .from('leagues')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating league:', error);
      return { success: false, league: null, error: error.message };
    }

    if (!data) {
      return { success: false, league: null, error: 'League not found' };
    }

    return { success: true, league: data };
  } catch (error) {
    console.error('Error in updateLeague:', error);
    return { success: false, league: null, error: error.message };
  }
};

/**
 * Delete league
 */
export const deleteLeague = async (id) => {
  try {
    const { error } = await supabase
      .from('leagues')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting league:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteLeague:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle registration enabled/disabled for a league
 */
export const toggleLeagueRegistration = async (leagueId, enabled) => {
  try {
    const { data, error } = await supabase
      .from('leagues')
      .update({ registration_enabled: enabled })
      .eq('id', leagueId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling league registration:', error);
      return { success: false, league: null, error: error.message };
    }

    if (!data) {
      return { success: false, league: null, error: 'League not found' };
    }

    return { success: true, league: data };
  } catch (error) {
    console.error('Error in toggleLeagueRegistration:', error);
    return { success: false, league: null, error: error.message };
  }
};

/**
 * Register user for a league
 */
export const registerUserForLeague = async (leagueId, userId) => {
  try {
    // Check if league exists and registration is enabled
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('id, registration_enabled, max_participants, registration_deadline, start_date, registration_fee')
      .eq('id', leagueId)
      .single();

    if (leagueError || !league) {
      return { success: false, registration: null, error: 'League not found' };
    }

    // Check if registration is enabled
    if (!league.registration_enabled) {
      return { success: false, registration: null, error: 'Registration is currently disabled for this league' };
    }

    // Check if registration deadline has passed
    const today = new Date();
    const deadline = new Date(league.registration_deadline);
    if (today > deadline) {
      return { success: false, registration: null, error: 'Registration deadline has passed' };
    }

    // Check if league has started
    const startDate = new Date(league.start_date);
    if (today >= startDate) {
      return { success: false, registration: null, error: 'League has already started' };
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('league_registrations')
      .select('id')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingRegistration) {
      return { success: false, registration: null, error: 'You are already registered for this league' };
    }

    // Check max participants if set
    if (league.max_participants) {
      const { count } = await supabase
        .from('league_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId)
        .in('status', ['registered', 'confirmed']);

      if (count >= league.max_participants) {
        return { success: false, registration: null, error: 'League has reached maximum participants' };
      }
    }

    // Register user (payment will be handled separately if fee > 0)
    const registrationData = {
      league_id: leagueId,
      user_id: userId,
      status: 'registered',
      payment_status: league.registration_fee > 0 ? 'pending' : 'succeeded',
      amount_paid: 0,
    };

    // If fee is 0, mark as paid immediately
    if (league.registration_fee === 0) {
      registrationData.payment_status = 'succeeded';
      registrationData.status = 'confirmed';
      registrationData.confirmed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('league_registrations')
      .insert([registrationData])
      .select()
      .single();

    if (error) {
      console.error('Error registering user for league:', error);
      return { success: false, registration: null, error: error.message };
    }

    return { success: true, registration: data, requiresPayment: league.registration_fee > 0, fee: league.registration_fee };
  } catch (error) {
    console.error('Error in registerUserForLeague:', error);
    return { success: false, registration: null, error: error.message };
  }
};

/**
 * Get all registrations for a league (admin only)
 */
export const getLeagueRegistrations = async (leagueId) => {
  try {
    const { data, error } = await supabase
      .from('league_registrations')
      .select(`
        *,
        user:users_metadata(
          id,
          name,
          email,
          cms_id,
          role,
          institution,
          phone,
          profile_picture_url,
          gender,
          date_of_birth,
          address,
          bio
        )
      `)
      .eq('league_id', leagueId)
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Error getting league registrations:', error);
      return { success: false, registrations: [], error: error.message };
    }

    return { success: true, registrations: data || [] };
  } catch (error) {
    console.error('Error in getLeagueRegistrations:', error);
    return { success: false, registrations: [], error: error.message };
  }
};

/**
 * Get user's registration status for a league
 */
export const getUserLeagueRegistration = async (leagueId, userId) => {
  try {
    const { data, error } = await supabase
      .from('league_registrations')
      .select('*')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting user league registration:', error);
      return { success: false, registration: null, error: error.message };
    }

    return { success: true, registration: data };
  } catch (error) {
    console.error('Error in getUserLeagueRegistration:', error);
    return { success: false, registration: null, error: error.message };
  }
};

/**
 * Cancel user's registration for a league
 */
export const cancelLeagueRegistration = async (leagueId, userId) => {
  try {
    const { error } = await supabase
      .from('league_registrations')
      .update({ status: 'cancelled' })
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .eq('status', 'registered');

    if (error) {
      console.error('Error cancelling league registration:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in cancelLeagueRegistration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export status update functions for use in controllers or scheduled tasks
 */
export { calculateLeagueStatus, updateLeagueStatus, updateAllLeaguesStatus };

/**
 * Update league registration payment status
 */
export const updateLeagueRegistrationPayment = async (registrationId, paymentData) => {
  try {
    const updateData = {};
    if (paymentData.payment_status !== undefined) updateData.payment_status = paymentData.payment_status;
    if (paymentData.stripe_session_id !== undefined) updateData.stripe_session_id = paymentData.stripe_session_id;
    if (paymentData.stripe_payment_intent_id !== undefined) updateData.stripe_payment_intent_id = paymentData.stripe_payment_intent_id;
    if (paymentData.amount_paid !== undefined) updateData.amount_paid = paymentData.amount_paid;
    if (paymentData.paid_at !== undefined) updateData.paid_at = paymentData.paid_at;
    
    // If payment succeeded, update status to confirmed
    if (paymentData.payment_status === 'succeeded') {
      updateData.status = 'confirmed';
      updateData.confirmed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('league_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating league registration payment:', error);
      return { success: false, registration: null, error: error.message };
    }

    return { success: true, registration: data };
  } catch (error) {
    console.error('Error in updateLeagueRegistrationPayment:', error);
    return { success: false, registration: null, error: error.message };
  }
};

/**
 * Get league registration by ID
 */
export const getLeagueRegistrationById = async (registrationId) => {
  try {
    const { data, error } = await supabase
      .from('league_registrations')
      .select(`
        *,
        league:leagues(id, name, registration_fee)
      `)
      .eq('id', registrationId)
      .single();

    if (error) {
      console.error('Error getting league registration:', error);
      return { success: false, registration: null, error: error.message };
    }

    return { success: true, registration: data };
  } catch (error) {
    console.error('Error in getLeagueRegistrationById:', error);
    return { success: false, registration: null, error: error.message };
  }
};



