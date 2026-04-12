import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductFilters, Category, Brand, Review } from '@/lib/types';
import { withTimeout } from '@/lib/supabase-utils';

const ITEMS_PER_PAGE = 12;
const HOMEPAGE_CACHE_KEY = 'enginemarkets_homepage_products';
const CATEGORIES_CACHE_KEY = 'enginemarkets_categories';
const BRANDS_CACHE_KEY = 'enginemarkets_brands';

export function useProducts(filters: ProductFilters = {}) {
  const queryClient = useQueryClient();
  const isHomepage = !filters.brand?.length && !filters.fuel_type?.length && !filters.engine_code && !filters.category_id && !filters.search && (filters.per_page === 16 || filters.per_page === 12);

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      console.log('[useProducts] Fetching with filters:', JSON.stringify(filters));
      try {
        const selectFields = 'id, name, brand, fuel_type, engine_code, price, mileage, year, images, category_id, availability, slug';
        
        // Use estimated count for better performance on large tables
        const useCount = !isHomepage;
        let query = supabase.from('products').select(selectFields, useCount ? { count: 'estimated' } : {});

        if (filters.brand?.length) {
          query = query.in('brand', filters.brand);
        }
        if (filters.fuel_type?.length) {
          query = query.in('fuel_type', filters.fuel_type);
        }
        if (filters.engine_code) {
          query = query.ilike('engine_code', `%${filters.engine_code}%`);
        }
        if (filters.price_min !== undefined) {
          query = query.gte('price', filters.price_min);
        }
        if (filters.price_max !== undefined) {
          query = query.lte('price', filters.price_max);
        }
        if (filters.availability !== undefined) {
          query = query.eq('availability', filters.availability);
        }
        
        if (filters.category_id) {
          // Check if this category has subcategories
          let categories = queryClient.getQueryData<Category[]>(['categories']);
          
          if (!categories) {
            const { data } = await supabase.from('categories').select('id, parent_id');
            categories = data as Category[];
          }

          if (categories) {
            const getChildIds = (parentId: string): string[] => {
              const children = categories!.filter(c => c.parent_id === parentId);
              let ids = children.map(c => c.id);
              children.forEach(c => {
                ids = [...ids, ...getChildIds(c.id)];
              });
              return ids;
            };

            const allCategoryIds = [filters.category_id, ...getChildIds(filters.category_id)];
            if (allCategoryIds.length > 1) {
              query = query.in('category_id', allCategoryIds);
            } else {
              query = query.eq('category_id', filters.category_id);
            }
          } else {
            query = query.eq('category_id', filters.category_id);
          }
        }

        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,engine_code.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
        }

        switch (filters.sort) {
          case 'price_asc': query = query.order('price', { ascending: true }); break;
          case 'price_desc': query = query.order('price', { ascending: false }); break;
          case 'name': query = query.order('name', { ascending: true }); break;
          default: query = query.order('created_at', { ascending: false });
        }

        const page = filters.page || 1;
        const perPage = filters.per_page || ITEMS_PER_PAGE;
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);

        const startTime = Date.now();
        const { data, error, count } = await withTimeout(query, 10000);
        const duration = Date.now() - startTime;

        if (error) {
          console.error('[useProducts] Supabase error:', error.message);
          throw error;
        }
        
        const products = (data as Product[]) || [];
        const result = { products, total: count || products.length };

        // Cache homepage products to localStorage for instant hydration next time
        if (isHomepage && products.length > 0) {
          try {
            localStorage.setItem(HOMEPAGE_CACHE_KEY, JSON.stringify(result));
          } catch (e) {
            console.warn('[useProducts] Failed to cache homepage products:', e);
          }
        }

        console.log(`[useProducts] Success: ${products.length} products found in ${duration}ms`);
        return result;
      } catch (err: any) {
        console.error('[useProducts] Unexpected error:', err.message || err);
        throw err;
      }
    },
    enabled: true,
    retry: 2, // Allow more retries for cold starts
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
    placeholderData: keepPreviousData,
    initialData: () => {
      // Hydrate homepage products instantly from localStorage if possible
      if (isHomepage) {
        try {
          const cached = localStorage.getItem(HOMEPAGE_CACHE_KEY);
          if (cached) {
            console.log('[useProducts] Hydrating homepage from localStorage cache');
            return JSON.parse(cached);
          }
        } catch (e) {
          return undefined;
        }
      }
      return undefined;
    }
  });
}

export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: async () => {
      console.log('[useProduct] Fetching product by id or slug:', idOrSlug);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        
        let query = supabase.from('products').select('id, name, brand, fuel_type, engine_code, price, mileage, year, images, category_id, availability, slug, description, condition, compatibility');
        if (isUuid) {
          query = query.eq('id', idOrSlug);
        } else {
          query = query.eq('slug', idOrSlug);
        }

        const { data, error } = await withTimeout(query.limit(1).maybeSingle(), 10000);
        if (error) {
          console.error('[useProduct] Supabase error:', error.message, error.code);
          throw error;
        }
        return data as Product | null;
      } catch (err: any) {
        console.error('[useProduct] Unexpected error:', err.message || err);
        throw err;
      }
    },
    enabled: !!idOrSlug,
    retry: 2,
    staleTime: 1000 * 60 * 60 * 24,
    placeholderData: keepPreviousData,
  });
}

export function useCartProducts(ids: string[]) {
  return useQuery({
    queryKey: ['products-cart', ids],
    queryFn: async () => {
      if (!ids.length) return [];
      console.log('[useCartProducts] Fetching products by IDs:', ids);
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('products')
            .select('id, name, brand, fuel_type, engine_code, price, mileage, year, images, category_id, availability, slug')
            .in('id', ids),
          10000
        );

        if (error) {
          console.error('[useCartProducts] Supabase error:', error.message);
          throw error;
        }
        return (data as Product[]) || [];
      } catch (err: any) {
        console.error('[useCartProducts] Unexpected error:', err.message || err);
        throw err;
      }
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('[useCategories] Fetching...');
      try {
        const startTime = Date.now();
        
        const [catResult, assocResult] = await Promise.all([
          withTimeout(supabase.from('categories').select('id, name, slug, parent_id, sort_order').order('sort_order'), 10000),
          withTimeout(supabase.from('category_brands').select('category_id, brand_id'), 10000)
        ]);
        
        if (catResult.error) throw catResult.error;
        if (assocResult.error) throw assocResult.error;

        const categories = catResult.data;
        const associations = assocResult.data;

        const duration = Date.now() - startTime;
        const result = categories.map(cat => ({
          ...cat,
          brand_ids: associations
            .filter(a => a.category_id === cat.id)
            .map(a => a.brand_id)
        })) as (Category & { brand_ids: string[] })[];

        // Cache to localStorage
        try {
          localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(result));
        } catch (e) {}

        console.log(`[useCategories] Success: ${categories?.length} items in ${duration}ms`);
        return result;
      } catch (err: any) {
        console.error('[useCategories] Unexpected error:', err.message || err);
        throw err;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
    placeholderData: keepPreviousData,
    initialData: () => {
      try {
        const cached = localStorage.getItem(CATEGORIES_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return undefined;
    }
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      console.log('[useBrands] Fetching...');
      try {
        const startTime = Date.now();
        const { data, error } = await withTimeout(
          supabase.from('brands').select('id, name, image_url').order('name'),
          10000
        );

        if (error) throw error;

        const duration = Date.now() - startTime;
        const brands = data as Brand[];

        // Cache to localStorage
        try {
          localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(brands));
        } catch (e) {}

        console.log(`[useBrands] Success: ${brands.length} brands in ${duration}ms`);
        return brands;
      } catch (err: any) {
        console.error('[useBrands] Unexpected error:', err.message || err);
        throw err;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
    placeholderData: keepPreviousData,
    initialData: () => {
      try {
        const cached = localStorage.getItem(BRANDS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
      return undefined;
    }
  });
}

export function useCategoryBrands(categoryId?: string) {
  return useQuery({
    queryKey: ['category-brands', categoryId],
    queryFn: async () => {
      console.log('Fetching category brands for:', categoryId);
      if (!categoryId) return [];
      try {
        const { data, error } = await supabase
          .from('category_brands')
          .select('brand_id')
          .eq('category_id', categoryId);
        if (error) {
          console.error('Supabase error fetching category brands:', error);
          throw error;
        }
        console.log('Successfully fetched category brands:', data?.length);
        return data.map(item => item.brand_id);
      } catch (err) {
        console.error('Unexpected error in useCategoryBrands:', err);
        throw err;
      }
    },
    enabled: !!categoryId,
    staleTime: 60000,
    placeholderData: keepPreviousData,
  });
}

export function useRelatedProducts(product: Product | undefined) {
  return useQuery({
    queryKey: ['related-products', product?.id],
    queryFn: async () => {
      console.log('Fetching related products for:', product?.id);
      if (!product) return [];
      try {
        // Optimized: Select only needed fields and use limit
        let query = supabase
          .from('products')
          .select('id, name, brand, price, images, slug')
          .neq('id', product.id)
          .limit(4);
        
        if (product.brand) {
          query = query.eq('brand', product.brand);
        } else {
          query = query.eq('category_id', product.category_id);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Supabase error fetching related products:', error);
          throw error;
        }
        return data as Product[];
      } catch (err) {
        console.error('Unexpected error in useRelatedProducts:', err);
        throw err;
      }
    },
    enabled: !!product,
    staleTime: 60000 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, quote, author, location, rating, created_at')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        // Handle case where table might not exist yet
        if (error.code === '42P01') return [];
        throw error;
      }
      return data as Review[];
    },
    enabled: !!productId,
    placeholderData: keepPreviousData,
    staleTime: 60000 * 5, // 5 minutes
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: Omit<Review, 'id' | 'created_at' | 'is_approved'>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // In a real app, we might not invalidate immediately if it requires approval,
      // but for UX we can optimistically show it or just show a success message.
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.product_id] });
    },
  });
}
