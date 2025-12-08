import { supabaseAdmin as supabase } from '../config/supabase.js';

/**
 * Get all leagues
 */
export const getLeagues = async () => {
  try {
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

    return { success: true, leagues: data || [] };
  } catch (error) {
    console.error('Error in getLeagues:', error);
    return { success: false, leagues: [] };
  }
};

/**
 * Get league by ID
 */
export const getLeagueById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting league:', error);
      return { success: false, league: null, error: error.message };
    }

    return { success: true, league: data };
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



