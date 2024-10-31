import { Trip } from '@/utils/types'

export const getTripById = async (tripId: number, supabase: any): Promise<Trip | null> => {

    console.log('The tripId received as argument is: ', tripId)
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single(); // Assuming you want a single trip
  
    if (error) {
      console.error('Error fetching trip:', error);
      return null;
    }

    console.log('The data is: ', data)
  
    return data;
  };