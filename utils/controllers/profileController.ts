import { supabase } from '@/lib/supabaseClient';

export const getProfileByUserId = async (userId: number) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data;
}