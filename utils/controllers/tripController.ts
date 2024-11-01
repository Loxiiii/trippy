import { Trip } from '@/utils/types';
import { createClient } from '@/utils/supabase/server';

export const getTripById = async (tripId: number): Promise<Trip | null> => {
  try {
    const supabase = await createClient();
    console.log('Supabase client created:', supabase);
    console.log('The tripId received as argument is: ', tripId);

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

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