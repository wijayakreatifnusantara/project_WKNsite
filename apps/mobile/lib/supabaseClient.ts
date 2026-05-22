import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Credentials tersinkronisasi otomatis dari database utama WKNsite
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vlpaszzbebgrfppklqml.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_hNO1hqX8FN2ejpyZe1oYJA_qvbkgEUy';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
