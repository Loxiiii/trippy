import { Stop, Trip } from '@/utils/types'
import { SupabaseClient } from '@supabase/supabase-js';

export const createStop = async (stop: Stop, supabase: SupabaseClient): Promise<boolean> => {
    const { data, error } = await supabase
        .from('stops')
        .insert([stop]);
    if (error) {
        console.error('Error inserting stop:', error);
        return false;
    }
    return true;
  };


export const getTripStops = async (tripId: number, supabase: SupabaseClient): Promise<Stop[] | null> => {
    const { data, error } = await supabase
        .from('stops')
        .select('*')
        .eq('trip_id', tripId)
        .order('trip_stop_number', { ascending: true });
    if (error) {
        console.error('Error fetching stops:', error);
        return null;
    }
    return data;
  }