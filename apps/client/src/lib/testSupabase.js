// Test Supabase Connection
import { supabase } from './supabaseClient';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    
    // Test connection by checking if we can access the employees table
    const { data, error } = await supabase
      .from('employees')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase connection successful!');
    console.log('Data:', data);
    
    return { success: true, data };
  } catch (err) {
    console.error('Supabase test error:', err);
    return { success: false, error: err.message };
  }
};

// Test authentication
export const testSupabaseAuth = async (email, password) => {
  try {
    console.log('Testing Supabase authentication...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('Auth error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Authentication successful!');
    console.log('User:', data.user);
    
    return { success: true, user: data.user };
  } catch (err) {
    console.error('Auth test error:', err);
    return { success: false, error: err.message };
  }
};
