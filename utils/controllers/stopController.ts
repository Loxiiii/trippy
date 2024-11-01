import { Stop, Trip } from '@/utils/types';
import { supabase } from '@/lib/supabaseClient';

export const getTripStopsByTripId = async (tripId: number): Promise<Stop[] | null> => {
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