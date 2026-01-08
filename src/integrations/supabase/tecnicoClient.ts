import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Custom storage para técnicos (sessionStorage com prefixo)
const tecnicoStorage = {
  getItem: (key: string) => {
    return sessionStorage.getItem(`tecnico-${key}`);
  },
  setItem: (key: string, value: string) => {
    sessionStorage.setItem(`tecnico-${key}`, value);
  },
  removeItem: (key: string) => {
    sessionStorage.removeItem(`tecnico-${key}`);
  },
};

export const supabaseTecnico = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: tecnicoStorage,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'tecnico-auth',
    },
  }
);
