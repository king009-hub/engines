import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FUEL_TYPES } from '@/lib/constants';
import { useCategories, useBrands } from '@/hooks/useProducts';
import type { ProductFilters as FiltersType } from '@/lib/types';
import { Filter, X, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { useTranslation } from 'react-i18next';
import { translateDynamic } from '@/lib/translate';

interface ProductFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  isMobile?: boolean;
}

const ProductFilters = ({ filters, onFiltersChange, isMobile }: ProductFiltersProps) => {
  const { t } = useTranslation();
  const [priceRange, setPriceRange] = useState([filters.price_min || 0, filters.price_max || 5000]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();

  const filteredBrands = useMemo(() => {
    if (!brands || !categories) return brands || [];
    if (!filters.category_id) return brands;
    
    // Helper to recursively find all subcategory IDs
    const getChildIds = (parentId: string): string[] => {
      const children = categories.filter(c => c.parent_id === parentId);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        ids = [...ids, ...getChildIds(c.id)];
      });
      return ids;
    };

    const allRelevantCategoryIds = [filters.category_id, ...getChildIds(filters.category_id)];
    
    // Get all brand IDs associated with any of these categories
    const allRelevantBrandIds = new Set<string>();
    allRelevantCategoryIds.forEach(catId => {
      const cat = categories.find(c => c.id === catId);
      if (cat && (cat as any).brand_ids) {
        (cat as any).brand_ids.forEach((bid: string) => allRelevantBrandIds.add(bid));
      }
    });

    if (allRelevantBrandIds.size === 0) return brands;
    return brands.filter(brand => allRelevantBrandIds.has(brand.id));
  }, [brands, filters.category_id, categories]);

  const categoryTree = useMemo(() => {
    if (!categories) return [];
    
    const roots = categories.filter(c => !c.parent_id);
    return roots.map(root => ({
      ...root,
      children: categories.filter(c => c.parent_id === root.id)
    }));
  }, [categories]);

  const [isApplying, setIsApplying] = useState(false);

  const handleFilterChange = (newFilters: FiltersType) => {
    setIsApplying(true);
    onFiltersChange(newFilters);
    // Add a small delay for visual feedback on mobile
    setTimeout(() => setIsApplying(false), 300);
  };

  const toggleCategory = (categoryId: string) => {
    handleFilterChange({ ...filters, category_id: filters.category_id === categoryId ? undefined : categoryId, page: 1 });
  };

  const toggleBrand = (brand: string) => {
    const current = filters.brand || [];
    const updated = current.includes(brand) ? current.filter(b => b !== brand) : [...current, brand];
    handleFilterChange({ ...filters, brand: updated.length ? updated : undefined, page: 1 });
  };

  const toggleFuelType = (fuel: string) => {
    const current = filters.fuel_type || [];
    const updated = current.includes(fuel) ? current.filter(f => f !== fuel) : [...current, fuel];
    handleFilterChange({ ...filters, fuel_type: updated.length ? updated : undefined, page: 1 });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    handleFilterChange({ ...filters, price_min: values[0], price_max: values[1], page: 1 });
  };

  const handleEngineCode = (code: string) => {
    handleFilterChange({ ...filters, engine_code: code || undefined, page: 1 });
  };

  const clearAll = () => {
    setPriceRange([0, 5000]);
    handleFilterChange({ sort: filters.sort, page: 1 });
  };

  const hasFilters = filters.brand?.length || filters.fuel_type?.length || filters.engine_code || filters.price_min || filters.price_max || filters.category_id;

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">{t('products.characteristics')}</h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-primary hover:underline">{t('cart.remove')}</button>
        )}
      </div>

      {/* Fuel Type */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">{t('products.fuel_type')}</h4>
        <div className="space-y-2">
          {FUEL_TYPES.map(fuel => (
            <label key={fuel} className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={filters.fuel_type?.includes(fuel) || false}
                onCheckedChange={() => toggleFuelType(fuel)}
              />
              {translateDynamic(fuel)}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">
          {t('products.price')}: ${priceRange[0]} - ${priceRange[1]}
        </h4>
        <Slider
          min={0}
          max={5000}
          step={50}
          value={priceRange}
          onValueChange={handlePriceChange}
          className="mt-2"
        />
      </div>

      {/* Brand */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">{t('products.brand')}</h4>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {brandsLoading ? (
            <div className="flex items-center text-xs text-muted-foreground italic">
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              {t('products.loading')}
            </div>
          ) : (
            filteredBrands?.map(brand => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={filters.brand?.includes(brand.name) || false}
                  onCheckedChange={() => toggleBrand(brand.name)}
                />
                {translateDynamic(brand.name)}
              </label>
            ))
          )}
        </div>
      </div>

      {/* Engine Code */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">{t('products.engine_code')}</h4>
        <Input
          placeholder="e.g. K9K"
          value={filters.engine_code || ''}
          onChange={e => handleEngineCode(e.target.value)}
          className="bg-background"
        />
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox
            checked={filters.availability === true}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, availability: checked ? true : undefined, page: 1 })}
          />
          {t('products.in_stock')}
        </label>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden flex items-center gap-2 font-bold uppercase text-xs tracking-widest border-[#cccccc] bg-[#f2f2f2]">
            <Filter className="h-3.5 w-3.5" />
            {t('products.characteristics')}
            {hasFilters && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto bg-card relative">
          {isApplying && (
            <div className="absolute inset-0 z-50 bg-background/50 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <SheetHeader className="pb-4 border-b border-border mb-6">
            <SheetTitle className="text-left font-black uppercase tracking-tighter text-xl">
              {t('products.characteristics')}
            </SheetTitle>
          </SheetHeader>
          {filterContent}
          <div className="mt-8">
            <Button onClick={() => setMobileOpen(false)} className="w-full font-bold uppercase tracking-widest bg-primary">
              {t('products.view_all', { name: '' })}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      {filterContent}
    </div>
  );
};

export default ProductFilters;
