import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { withTimeout } from '@/lib/supabase-utils';
import { AuthContext } from './AuthContextObject';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('[AuthContext] Initializing...');
    let mounted = true;

    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Fetching session...');
        // Increased timeout to 30s for slow connections
        const { data: { session }, error: sessionError } = await withTimeout(supabase.auth.getSession(), 30000);
        if (sessionError) throw sessionError;

        if (mounted) {
          console.log('[AuthContext] Session found:', !!session);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (!session?.user) {
            setLoading(false);
          } else {
            checkAdminRole(session.user.id);
          }
        }
      } catch (error: any) {
        console.error('[AuthContext] Error checking auth session:', error.message || error);
        // Don't get stuck in loading even if session fetch fails
        if (mounted) setLoading(false);
      }
    };

    const checkAdminRole = async (userId: string) => {
      try {
        console.log('[AuthContext] Checking admin role (background)...');
        // Increased timeout to 30s for slow connections
        const { data, error: rpcError } = await withTimeout(supabase.rpc('has_role', { 
          _user_id: userId, 
          _role: 'admin' 
        }), 30000);
        
        if (mounted) {
          if (rpcError) throw rpcError;
          console.log('[AuthContext] Is admin:', !!data);
          setIsAdmin(!!data);
        }
      } catch (error: any) {
        console.error('[AuthContext] Admin role check failed:', error.message || error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event);
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          // Increased timeout to 30s for slow connections
          const { data, error: rpcError } = await withTimeout(supabase.rpc('has_role', { 
            _user_id: session.user.id, 
            _role: 'admin' 
          }), 30000);
          
          if (rpcError) throw rpcError;
          setIsAdmin(!!data);
        } catch (error: any) {
          console.error('[AuthContext] Error checking admin role on change:', error.message || error);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
