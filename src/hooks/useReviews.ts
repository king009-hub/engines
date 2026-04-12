import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/lib/types';
import { useAuth } from './useAuth';

export function useAllReviews() {
  const { loading: authLoading } = useAuth();

  return useQuery<Review[], Error>({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          quote,
          author,
          location,
          rating,
          is_approved,
          created_at,
          product_id,
          product:products(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') return []; // Table doesn't exist yet
        throw new Error(error.message);
      }
      return data as any;
    },
    enabled: !authLoading,
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation<Review, Error, { id: string; is_approved: boolean }>({
    mutationFn: async ({ id, is_approved }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({ is_approved })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    },
  });
}
