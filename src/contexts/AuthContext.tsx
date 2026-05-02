import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContextObject';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        // Remove custom timeout to let Supabase handle its own connection
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (!session?.user) {
            setLoading(false);
          } else {
            checkAdminRole(session.user.id);
          }
        }
      } catch (error: any) {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const checkAdminRole = async (userId: string) => {
      try {
        const { data, error: rpcError } = await supabase.rpc('has_role', { 
          _user_id: userId, 
          _role: 'admin' 
        });
        
        if (mounted) {
          if (rpcError) throw rpcError;
          setIsAdmin(!!data);
        }
      } catch (error: any) {
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const { data, error: rpcError } = await supabase.rpc('has_role', { 
            _user_id: session.user.id, 
            _role: 'admin' 
          });
          
          if (rpcError) throw rpcError;
          setIsAdmin(!!data);
        } catch (error: any) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
