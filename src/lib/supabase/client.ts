import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { getSupabaseEnvironment, type SupabaseEnvironment } from '@/config/environment';

import type { Database } from './database.types';

export function createSupabaseClient(environment: SupabaseEnvironment) {
  return createClient<Database>(environment.supabaseUrl, environment.supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = createSupabaseClient(getSupabaseEnvironment());
