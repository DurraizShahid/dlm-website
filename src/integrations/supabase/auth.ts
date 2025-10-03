import { supabase } from './client';

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, options?: { data?: Record<string, any> }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url, role')
    .eq('id', userId)
    .single();
  
  // If no data is found, data will be null and error will be like "PGRST100: Expected 1 row but found 0"
  // We want to treat this as a missing profile, not a critical error that prevents loading.
  if (error && error.code === 'PGRST100') { 
    console.warn(`Profile not found for user ID: ${userId}. Error: ${error.message}`);
    return null; // Return null if profile not found
  }
  if (error) {
    throw error; // Re-throw other types of errors
  }
  return data;
};

// NEW FUNCTION: Link unlinked applications to a user
export const linkApplicationsToUser = async (userId: string, contact: string) => {
  const { data, error } = await supabase
    .from('applications')
    .update({ user_id: userId })
    .eq('contact', contact)
    .is('user_id', null); // Only update applications that are not yet linked

  if (error) throw error;
  return data;
};