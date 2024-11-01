import { Trip } from '@/utils/types'
import { supabase } from '@/lib/supabaseClient';


// utils/controllers/tripController.ts
export const getTripById = async (tripId: number): Promise<Trip | null> => {
  try {
    console.log('The tripId received as argument is: ', tripId);
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single(); // Use .single() if you expect only one result

    console.log('The data is: ', data);

    if (error) {
      console.error('Error fetching trip:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching trip:', error);
    return null;
  }
};