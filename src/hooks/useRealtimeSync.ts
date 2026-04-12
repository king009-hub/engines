import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook to manage global real-time synchronization for the application.
 * Subscribes to changes in key tables and invalidates relevant queries.
 */
export const useRealtimeSync = () => {
  const queryClient = useQueryClient();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    // Tables to watch and their corresponding query keys to invalidate
    const syncRules = [
      { table: 'products', keys: ['products', 'product', 'related-products'] },
      { table: 'categories', keys: ['categories'] },
      { table: 'category_brands', keys: ['categories', 'category-brands'] },
      { table: 'brands', keys: ['brands'] },
    ];

    const channels = syncRules.map(rule => {
      return supabase
        .channel(`global-sync:${rule.table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: rule.table }, (payload) => {
          console.log(`Realtime update for ${rule.table}:`, payload);
          rule.keys.forEach(key => {
            // Background invalidation - triggers a refetch without showing a "hard" loading state
            queryClient.invalidateQueries({ 
              queryKey: [key],
              refetchType: 'active' // only refetch queries that are currently being used on screen
            });
          });
        })
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${rule.table}:`, status);
        });
    });

    return () => {
      channels.forEach(channel => {
        console.log('Removing realtime channel');
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient]);
};
