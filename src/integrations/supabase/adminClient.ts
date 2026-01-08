import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Custom storage para admins (sessionStorage com prefixo)
const adminStorage = {
  getItem: (key: string) => {
    return sessionStorage.getItem(`admin-${key}`);
  },
  setItem: (key: string, value: string) => {
    sessionStorage.setItem(`admin-${key}`, value);
  },
  removeItem: (key: string) => {
    sessionStorage.removeItem(`admin-${key}`);
  },
};

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: adminStorage,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'admin-auth',
    },
  }
);
