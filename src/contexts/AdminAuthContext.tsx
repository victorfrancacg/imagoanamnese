import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseAdmin as supabase } from '@/integrations/supabase/adminClient';

export interface Profile {
  id: string;
  nome: string;
  cpf: string | null;
  user_type: 'tecnico' | 'admin';
  professional_id: string | null;
  status: 'pendente' | 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

interface AdminAuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      console.log('[ADMIN] Loading profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[ADMIN] Profile load error:', error);

        // Se o perfil não existe, criar um padrão
        if (error.code === 'PGRST116') {
          console.log('[ADMIN] Profile not found, creating default profile');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              nome: 'Usuário',
              user_type: 'admin'
            })
            .select()
            .single();

          if (createError) {
            console.error('[ADMIN] Error creating profile:', createError);
            setProfile(null);
            return null;
          }

          console.log('[ADMIN] Profile created successfully:', newProfile);
          setProfile(newProfile);
          return newProfile;
        }

        throw error;
      }

      console.log('[ADMIN] Profile loaded successfully:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('[ADMIN] Error loading profile:', error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let isInitializing = true;

    // Check active session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user.id);
          if (!mounted) return;
        }
      } catch (error) {
        console.error('[ADMIN] Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          isInitializing = false;
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[ADMIN] Auth state changed:', _event);

      // Ignorar eventos durante inicialização
      if (isInitializing) {
        console.log('[ADMIN] Still initializing, skipping event');
        return;
      }

      if (!mounted) return;

      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user.id);
          if (!mounted) return;
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('[ADMIN] Error in auth state change:', error);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    // Limpar estados primeiro
    setProfile(null);
    setUser(null);
    setSession(null);

    // Limpar sessionStorage manualmente
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('admin-')) {
        sessionStorage.removeItem(key);
      }
    });

    // Logout do Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AdminAuthContext.Provider value={{ user, profile, session, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
