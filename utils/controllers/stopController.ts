import { Stop } from '@/utils/types';
// import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@/utils/supabase/server';

export const getTripStopsByTripId = async (tripId: number): Promise<Stop[] | null> => {
    const supabase = await createClient();
    const { data: stopsData, error: stopsError } = await supabase
        .from('stops')
        .select('*')
        .eq('trip_id', tripId)
        .order('trip_stop_number', { ascending: true });

    if (stopsError) {
        console.error('Error fetching stops:', stopsError);
        return null;
    }

    if (!stopsData) {
        return null;
    }

    const stopsWithPois = await Promise.all(stopsData.map(async (stop: Stop) => {
        const { data: poisData, error: poisError } = await supabase
            .from('pois')
            .select('*')
            .eq('stop_id', stop.id);

        if (poisError) {
            console.error(`Error fetching pois for stop ${stop.id}:`, poisError);
            stop['pois'] = [];
        } else {
            stop['pois'] = poisData || [];
        }

        return stop;
    }));

    return stopsWithPois;
}