import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import ProductSort from '@/components/products/ProductSort';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, Loader2 } from 'lucide-react';
import type { ProductFilters as FiltersType } from '@/lib/types';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '@/lib/translate';

const Products = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();

  const filters: FiltersType = useMemo(() => ({
    brand: searchParams.get('brand') ? searchParams.get('brand')!.split(',') : undefined,
    fuel_type: searchParams.get('fuel_type') ? searchParams.get('fuel_type')!.split(',') : undefined,
    engine_code: searchParams.get('engine_code') || undefined,
    price_min: searchParams.get('price_min') ? Number(searchParams.get('price_min')) : undefined,
    price_max: searchParams.get('price_max') ? Number(searchParams.get('price_max')) : undefined,
    availability: searchParams.get('availability') === 'true' ? true : undefined,
    category_id: (() => {
      const catSlug = searchParams.get('category');
      if (catSlug && categories) {
        const cat = categories.find(c => c.slug === catSlug);
        return cat?.id;
      }
      return undefined;
    })(),
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as FiltersType['sort']) || 'newest',
    page: Number(searchParams.get('page')) || 1,
    per_page: ITEMS_PER_PAGE,
  }), [searchParams, categories]);

  const { data, isLoading, isFetching } = useProducts(filters);

  const updateFilters = (newFilters: FiltersType) => {
    const params = new URLSearchParams();
    if (newFilters.brand?.length) params.set('brand', newFilters.brand.join(','));
    if (newFilters.fuel_type?.length) params.set('fuel_type', newFilters.fuel_type.join(','));
    if (newFilters.engine_code) params.set('engine_code', newFilters.engine_code);
    if (newFilters.price_min) params.set('price_min', String(newFilters.price_min));
    if (newFilters.price_max) params.set('price_max', String(newFilters.price_max));
    if (newFilters.availability) params.set('availability', 'true');
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
    
    // Update category from category_id
    if (newFilters.category_id && categories) {
      const cat = categories.find(c => c.id === newFilters.category_id);
      if (cat) params.set('category', cat.slug);
    } else {
      const catSlug = searchParams.get('category');
      if (catSlug && !newFilters.category_id) {
        // If we're clearing the category from filters, don't re-add the slug
      } else if (catSlug) {
        params.set('category', catSlug);
      }
    }

    setSearchParams(params);
  };

  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);
  const currentPage = filters.page || 1;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };
  
  const categoryName = useMemo(() => {
    const catSlug = searchParams.get('category');
    if (catSlug && categories) {
      const cat = categories.find(c => c.slug === catSlug);
      if (cat?.parent_id) {
        const parent = categories.find(p => p.id === cat.parent_id);
        return `${translateDynamic(parent?.name)} / ${translateDynamic(cat.name)}`;
      }
      return translateDynamic(cat?.name) || translateDynamic(catSlug.replace('-', ' '));
    }
    return t('products.all_products');
  }, [searchParams, categories, t]);

  const subCategories = useMemo(() => {
    if (!categories || !filters.category_id) return [];
    return categories.filter(c => c.parent_id === filters.category_id);
  }, [categories, filters.category_id]);

  const metaDescription = `Browse our selection of ${categoryName}. High-quality auto parts, used engines, and gearboxes available at Engine Markets.`;

  return (
    <Layout title={categoryName} description={metaDescription}>
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary flex items-center gap-1"><Home className="h-3 w-3" /> {t('products.home')}</Link>
            <span>/</span>
            <span className="text-foreground capitalize font-semibold">{categoryName}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - hidden on mobile/tablet */}
          <div className="hidden lg:block w-64 shrink-0">
            <ProductFilters filters={filters} onFiltersChange={updateFilters} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="bg-card border border-border p-3 rounded-lg mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="lg:hidden w-full sm:w-auto">
                <ProductFilters filters={filters} onFiltersChange={updateFilters} isMobile />
              </div>
              <ProductSort
                value={filters.sort || 'newest'}
                onChange={v => updateFilters({ ...filters, sort: v as FiltersType['sort'], page: 1 })}
                total={data?.total || 0}
                page={currentPage}
                perPage={ITEMS_PER_PAGE}
              />
            </div>

            <div className="relative">
              {isFetching && !isLoading && (
                <div className="absolute inset-0 z-10 bg-background/20 backdrop-blur-[1px] flex items-start justify-center pt-20">
                  <div className="bg-card border border-border px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">{t('products.loading')}</span>
                  </div>
                </div>
              )}
              <div className={`transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <ProductGrid products={data?.products || []} loading={isLoading} />
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 border-t border-border pt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => updateFilters({ ...filters, page: currentPage - 1 })}
                    className="gap-1 font-bold text-[10px] sm:text-xs uppercase"
                  >
                    <ChevronLeft className="h-4 w-4" /> {t('products.previous')}
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((p, i) => (
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">...</span>
                      ) : (
                        <Button
                          key={`page-${p}`}
                          variant={p === currentPage ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => updateFilters({ ...filters, page: p as number })}
                          className={`w-8 h-8 sm:w-9 sm:h-9 font-bold text-xs ${p === currentPage ? 'bg-[#b38a2e] text-white hover:bg-[#a07a29]' : 'text-foreground'}`}
                        >
                          {p}
                        </Button>
                      )
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => updateFilters({ ...filters, page: currentPage + 1 })}
                    className="gap-1 font-bold text-[10px] sm:text-xs uppercase"
                  >
                    {t('products.next')} <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
