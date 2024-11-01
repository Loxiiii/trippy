// import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@/utils/supabase/server';

export const getProfileByUserId = async (userId: number) => {
    const supabase = await createClient();
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