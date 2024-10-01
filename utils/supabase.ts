import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '~/types/supabase';

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = 'https://xsmvurpfpaavwhqhbage.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzbXZ1cnBmcGFhdndocWhiYWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM4NjU4NDksImV4cCI6MjAzOTQ0MTg0OX0.uSA3JSYLi_EqP6zR1IytZ6gtI0I3NcIJgQx4cmyD8X0';

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
