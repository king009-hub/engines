import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useCategories, useBrands, useProducts } from '@/hooks/useProducts';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '@/lib/translate';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const NavBar = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();

  // Prefetching logic for categories
  const prefetchCategory = (catSlug: string) => {
    const cat = categories?.find(c => c.slug === catSlug);
    if (!cat) return;

    queryClient.prefetchQuery({
      queryKey: ['products', { category_id: cat.id, per_page: 16 }],
      staleTime: 1000 * 60 * 60, // 1 hour
    });
  };

  return (
    <>
      {/* Desktop Navigation - only show on large screens (1024px+) */}
      <nav className="bg-[#f2f2f2] sticky top-0 z-50 hidden lg:block border-b border-[#dddddd]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-start gap-0">
          {categoriesLoading ? (
            <div className="flex items-center px-3 py-3 text-[11px] font-normal tracking-wider text-gray-500 uppercase">
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
              {t('products.loading')}
            </div>
          ) : (
            categories?.filter(c => !c.parent_id).map(cat => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(cat.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  onMouseEnter={() => prefetchCategory(cat.slug)}
                  className="flex items-center gap-1 px-5 py-3 text-[12px] font-medium tracking-tighter text-foreground hover:bg-gray-200 transition-colors uppercase whitespace-nowrap border-r border-[#cccccc] last:border-r-0"
                >
                  {translateDynamic(cat.name)}
                  <ChevronDown className="h-3 w-3 opacity-60 ml-1" />
                </Link>
                {hoveredItem === cat.id && (
                  (() => {
                    // Engines specific layout matching the reference image
                    if (cat.slug === 'engines') {
                      const engineColumns = [
                        {
                          title: 'USED DIESEL',
                          fuel: 'Diesel',
                          items: [
                            { name: 'BMW - MINI', brands: ['BMW', 'Mini'] },
                            { name: 'RENAULT NISSAN VOLVO', brands: ['Renault', 'Nissan', 'Volvo'] },
                            { name: 'MERCEDES SMART JEEP', brands: ['Mercedes', 'Smart', 'Jeep'] },
                            { name: 'PSA - FORD', brands: ['Peugeot', 'Citroen', 'Ford'] },
                            { name: 'OPEL', brands: ['Opel'] },
                            { name: 'VOLKSWAGEN - AUDI', brands: ['Volkswagen', 'Audi'] },
                            { name: 'KIA CHEVROLET', brands: ['Kia', 'Chevrolet'] },
                            { name: 'FIAT - LANCIA - ALFA', brands: ['Fiat', 'Lancia', 'Alfa Romeo'] },
                            { name: 'IVECO', brands: ['Iveco'] },
                            { name: 'JAGUAR LAND-ROVER', brands: ['Jaguar', 'Land Rover'] },
                            { name: 'MITSUBISHI', brands: ['Mitsubishi'] },
                            { name: 'MAZDA - SUZUKI', brands: ['Mazda', 'Suzuki'] },
                            { name: 'TOYOTA HONDA', brands: ['Toyota', 'Honda'] },
                          ]
                        },
                        {
                          title: 'USED PETROL',
                          fuel: 'Petrol',
                          items: [
                            { name: 'RENAULT NISSAN', brands: ['Renault', 'Nissan'] },
                            { name: 'PSA FORD JAGUAR', brands: ['Peugeot', 'Citroen', 'Ford', 'Jaguar'] },
                            { name: 'PORSCHE', brands: ['Porsche'] },
                            { name: 'VOLKSWAGEN - AUDI', brands: ['Volkswagen', 'Audi'] },
                            { name: 'MITSUBISHI', brands: ['Mitsubishi'] },
                            { name: 'BMW - MINI', brands: ['BMW', 'Mini'] },
                            { name: 'MAZDA PERFORMANCE', brands: ['Mazda'] },
                            { name: 'MERCEDES - SMART', brands: ['Mercedes', 'Smart'] },
                            { name: 'HONDA HYUNDAI', brands: ['Honda', 'Hyundai'] },
                            { name: 'LOTUS SECMA', brands: ['Lotus', 'Secma'] },
                            { name: 'FORD', brands: ['Ford'] },
                            { name: 'OPEL FIAT ABARTH', brands: ['Opel', 'Fiat'] },
                            { name: 'SUZUKI SUBARU', brands: ['Suzuki', 'Subaru'] },
                          ]
                        }
                      ];

                      return (
                        <div className="absolute top-full left-0 bg-white border border-border shadow-2xl z-50 w-[550px]">
                          <div className="grid grid-cols-2 gap-6 p-6">
                            {engineColumns.map((col, idx) => (
                              <div key={idx} className="flex flex-col gap-4">
                                <Link
                                  to={`/products?category=engines&fuel_type=${col.fuel}`}
                                  className="font-black text-[13px] uppercase text-foreground tracking-tighter border-b-2 border-primary/10 pb-1 hover:text-primary transition-colors"
                                  onClick={() => setHoveredItem(null)}
                                >
                                  {col.title}
                                </Link>
                                <div className="flex flex-col gap-1">
                                  {col.items.map((item, itemIdx) => {
                                    const brandsQuery = item.brands ? `&brand=${item.brands.join(',')}` : '';
                                    return (
                                      <Link
                                        key={itemIdx}
                                        to={`/products?category=engines&fuel_type=${col.fuel}${brandsQuery}`}
                                        className="block text-[11px] font-medium text-muted-foreground hover:text-primary py-0.5 uppercase tracking-tight"
                                        onClick={() => setHoveredItem(null)}
                                      >
                                        {item.name}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Engine Parts specific layout
                    if (cat.slug === 'engine-parts') {
                      const enginePartsColumns = [
                        {
                          title: 'LOW ENGINES',
                          slug: 'low-engines',
                          items: [
                            { name: 'VOLKSWAGEN - AUDI', brands: ['Volkswagen', 'Audi'] },
                            { name: 'RENAULT NISSAN VOLVO', brands: ['Renault', 'Nissan', 'Volvo'] },
                            { name: 'MERCEDES SMART JEEP', brands: ['Mercedes', 'Smart', 'Jeep'] },
                            { name: 'BMW - MINI', brands: ['BMW', 'Mini'] },
                            { name: 'FIAT OPEL SAAB ALFA', brands: ['Fiat', 'Opel', 'Saab', 'Alfa Romeo'] },
                            { name: 'HYUNDAI KIA CHEVROLET', brands: ['Hyundai', 'Kia', 'Chevrolet'] },
                            { name: 'PORSCHE', brands: ['Porsche'] },
                            { name: 'SUBARU ISUZU', brands: ['Subaru', 'Isuzu'] },
                            { name: 'PSA - FORD', brands: ['Peugeot', 'Citroen', 'Ford'] },
                            { name: 'MITSUBISHI TOYOTA', brands: ['Mitsubishi', 'Toyota'] },
                            { name: 'LAND-ROVER JAGUAR', brands: ['Land Rover', 'Jaguar'] },
                          ]
                        },
                        {
                          title: 'CYLINDER HEADS',
                          slug: 'culasses',
                          items: [
                            { name: 'VOLKSWAGEN - AUDI', brands: ['Volkswagen', 'Audi'] },
                            { name: 'BMW - MINI', brands: ['BMW', 'Mini'] },
                            { name: 'MERCEDES SMART JEEP', brands: ['Mercedes', 'Smart', 'Jeep'] },
                            { name: 'PSA - FORD', brands: ['Peugeot', 'Citroen', 'Ford'] },
                            { name: 'PORSCHE', brands: ['Porsche'] },
                            { name: 'RENAULT NISSAN VOLVO', brands: ['Renault', 'Nissan', 'Volvo'] },
                            { name: 'HYUNDAI KIA CHEVROLET', brands: ['Hyundai', 'Kia', 'Chevrolet'] },
                            { name: 'FIAT OPEL SAAB ALFA', brands: ['Fiat', 'Opel', 'Saab', 'Alfa Romeo'] },
                            { name: 'MITSUBISHI TOYOTA', brands: ['Mitsubishi', 'Toyota'] },
                            { name: 'SUBARU ISUZU', brands: ['Subaru', 'Isuzu'] },
                            { name: 'LAND-ROVER JAGUAR', brands: ['Land Rover', 'Jaguar'] },
                          ]
                        },
                        {
                          title: 'OTHER ENGINE PARTS',
                          items: [
                            { name: 'COLLECTORS', subTitle: 'INTAKE-EXHAUST', slug: 'collectors' },
                            { name: 'BEAMS - CALCULATORS', subTitle: 'USED', slug: 'beams-calculators' },
                            { name: 'CRANKSHAFTS - CONNECTING RODS', subTitle: 'USED', slug: 'crankshafts-connecting-rods' },
                            { name: 'SENSORS PROBES', subTitle: 'USED', slug: 'sensors-probes' },
                          ]
                        },
                        {
                          title: 'INJECTIONS',
                          items: [
                            { name: 'INJECTORS DIESEL', subTitle: 'USED', slug: 'injectors-diesel' },
                            { name: 'INJECTORS PETROL', subTitle: 'USED', slug: 'injectors-essence' },
                            { name: 'INJECTION PUMP', subTitle: 'USED', slug: 'injection-pump' },
                          ]
                        },
                        {
                          title: 'VARIOUS',
                          items: [
                            { name: 'CONSUMABLES', slug: 'consumables' },
                            { name: 'VARIOUS OPPORTUNITIES', slug: 'various-opportunities' },
                          ]
                        }
                      ];

                      return (
                        <div className="absolute top-full left-0 bg-white border border-border shadow-2xl z-50 w-[1100px] -ml-40">
                          <div className="grid grid-cols-5 gap-6 p-6">
                            {enginePartsColumns.map((col, idx) => (
                              <div key={idx} className="flex flex-col gap-4">
                                <Link
                                  to={`/products?category=${col.slug || 'engine-parts'}`}
                                  className="font-black text-[13px] uppercase text-foreground tracking-tighter border-b-2 border-primary/10 pb-1 hover:text-primary transition-colors"
                                  onClick={() => setHoveredItem(null)}
                                >
                                  {col.title}
                                </Link>
                                <div className="flex flex-col gap-2">
                                  {col.items.map((item, itemIdx) => {
                                    const brandsQuery = item.brands ? `&brand=${item.brands.join(',')}` : '';
                                    const targetSlug = item.slug || col.slug;
                                    
                                    return (
                                      <div key={itemIdx} className="group">
                                        <Link
                                          to={`/products?category=${targetSlug}${brandsQuery}`}
                                          className="block text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all py-0.5 px-1 rounded-sm uppercase tracking-tight"
                                          onClick={() => setHoveredItem(null)}
                                        >
                                          <div className="flex flex-col">
                                            <span className="group-hover:translate-x-1 transition-transform">{item.name}</span>
                                            {item.subTitle && (
                                              <span className="text-[9px] opacity-60 font-normal">{item.subTitle}</span>
                                            )}
                                          </div>
                                        </Link>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Gearboxes specific layout
                    if (cat.slug === 'gearboxes') {
                      const gearboxesColumns = [
                        {
                          title: 'USED AUTOMATIC',
                          slug: 'gearboxes',
                          items: [
                            { name: 'MERCEDES SMART JEEP', brands: ['Mercedes', 'Smart', 'Jeep'] },
                            { name: 'PSA FORD VOLVO', brands: ['Peugeot', 'Citroen', 'Ford', 'Volvo'] },
                            { name: 'BMW', brands: ['BMW'] },
                            { name: 'PORSCHE', brands: ['Porsche'] },
                            { name: 'VOLKSWAGEN - AUDI', brands: ['Volkswagen', 'Audi'] },
                            { name: 'HYUNDAI - KIA', brands: ['Hyundai', 'Kia'] },
                            { name: 'RENAULT - NISSAN', brands: ['Renault', 'Nissan'] },
                            { name: 'OPEL CADILLAC', brands: ['Opel', 'Cadillac'] },
                            { name: 'MINI', brands: ['Mini'] },
                            { name: 'IVECO - CHEVROLET', brands: ['Iveco', 'Chevrolet'] },
                            { name: 'HONDA - MITSUBISHI', brands: ['Honda', 'Mitsubishi'] },
                            { name: 'TOYOTA JAGUAR', brands: ['Toyota', 'Jaguar'] },
                            { name: 'SUZUKI', brands: ['Suzuki'] },
                          ]
                        },
                        {
                          title: 'USED MANUALS',
                          slug: 'gearboxes',
                          items: [
                            { name: 'VOLKSWAGEN - AUDI', brands: ['Volkswagen', 'Audi'] },
                            { name: 'RENAULT NISSAN VOLVO', brands: ['Renault', 'Nissan', 'Volvo'] },
                            { name: 'PSA - FORD', brands: ['Peugeot', 'Citroen', 'Ford'] },
                            { name: 'FIAT - LANCIA - ALFA', brands: ['Fiat', 'Lancia', 'Alfa Romeo'] },
                            { name: 'BMW - MINI', brands: ['BMW', 'Mini'] },
                            { name: 'HONDA', brands: ['Honda'] },
                            { name: 'MERCEDES- SMART- JEEP', brands: ['Mercedes', 'Smart', 'Jeep'] },
                            { name: 'MG ISUZU', brands: ['MG', 'Isuzu'] },
                            { name: 'MAZDA IVECO', brands: ['Mazda', 'Iveco'] },
                            { name: 'FORD - DODGE', brands: ['Ford', 'Dodge'] },
                            { name: 'OPEL', brands: ['Opel'] },
                            { name: 'PORSCHE', brands: ['Porsche'] },
                            { name: 'LOTUS SECMA', brands: ['Lotus', 'Secma'] },
                            { name: 'TOYOTA MITSUBISHI', brands: ['Toyota', 'Mitsubishi'] },
                          ]
                        }
                      ];

                      return (
                        <div className="absolute top-full left-0 bg-white border border-border shadow-2xl z-50 w-[600px]">
                          <div className="grid grid-cols-2 gap-6 p-6">
                            {gearboxesColumns.map((col, idx) => (
                              <div key={idx} className="flex flex-col gap-4">
                                <Link
                                  to={`/products?category=${col.slug}`}
                                  className="font-black text-[13px] uppercase text-foreground tracking-tighter border-b-2 border-primary/10 pb-1 hover:text-primary transition-colors"
                                  onClick={() => setHoveredItem(null)}
                                >
                                  {col.title}
                                </Link>
                                <div className="flex flex-col gap-1">
                                  {col.items.map((item, itemIdx) => {
                                    const brandsQuery = item.brands ? `&brand=${item.brands.join(',')}` : '';
                                    return (
                                      <Link
                                        key={itemIdx}
                                        to={`/products?category=${col.slug}${brandsQuery}`}
                                        className="block text-[11px] font-medium text-muted-foreground hover:text-primary py-0.5 uppercase tracking-tight"
                                        onClick={() => setHoveredItem(null)}
                                      >
                                        {item.name}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // Standard dynamic layout for other categories
                    const subCategories = categories?.filter(c => c.parent_id === cat.id) || [];
                    const hasSubCategories = subCategories.length > 0;

                    if (hasSubCategories) {
                      const colCount = Math.min(5, subCategories.length);
                      const widthClass = colCount === 1 ? 'w-[250px]' : 
                                       colCount === 2 ? 'w-[500px]' : 
                                       colCount === 3 ? 'w-[750px]' : 
                                       colCount === 4 ? 'w-[1000px]' : 'w-[1200px]';
                      
                      const gridClass = colCount === 1 ? 'grid-cols-1' : 
                                      colCount === 2 ? 'grid-cols-2' : 
                                      colCount === 3 ? 'grid-cols-3' : 
                                      colCount === 4 ? 'grid-cols-4' : 'grid-cols-5';

                      return (
                        <div className={`absolute top-full left-0 bg-white border border-border shadow-2xl z-50 p-6 ${widthClass} ${colCount > 3 ? '-ml-40' : ''}`}>
                          <div className={`grid ${gridClass} gap-8`}>
                            {subCategories.map(subCat => (
                              <div key={subCat.id} className="flex flex-col gap-4">
                                <Link
                                  to={`/products?category=${subCat.slug}`}
                                  className="font-black text-[13px] uppercase text-foreground tracking-tighter border-b-2 border-primary/10 pb-1 hover:text-primary transition-colors"
                                  onClick={() => setHoveredItem(null)}
                                >
                                  {translateDynamic(subCat.name)}
                                </Link>
                                <div className="flex flex-col gap-1">
                                  {(brands?.filter(brand => subCat.brand_ids?.includes(brand.id)) || []).map(brand => (
                                    <Link
                                      key={brand.id}
                                      to={`/products?category=${subCat.slug}&brand=${brand.name}`}
                                      className="block text-[11px] font-medium text-muted-foreground hover:text-primary py-0.5 uppercase tracking-tight transition-colors"
                                      onClick={() => setHoveredItem(null)}
                                    >
                                      {translateDynamic(brand.name)}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    const catBrands = brands?.filter(brand => cat.brand_ids?.includes(brand.id)) || [];
                    const colCount = Math.max(1, Math.ceil(catBrands.length / 8));
                    const widthClass = colCount === 1 ? 'min-w-[200px]' : 
                                     colCount === 2 ? 'min-w-[400px]' : 
                                     colCount === 3 ? 'min-w-[600px]' : 'min-w-[800px]';
                    const gridClass = colCount === 1 ? 'grid-cols-1' : 
                                    colCount === 2 ? 'grid-cols-2' : 
                                    colCount === 3 ? 'grid-cols-3' : 'grid-cols-4';

                    return (
                      <div className={`absolute top-full left-0 bg-white border border-border shadow-2xl z-50 ${widthClass}`}>
                        <div className="p-2">
                          {brandsLoading ? (
                            <div className="px-4 py-2 text-sm text-muted-foreground italic flex items-center">
                              <Loader2 className="h-3 w-3 animate-spin mr-2" />
                              {t('products.loading')}
                            </div>
                          ) : (
                            <>
                              {catBrands.length === 0 ? (
                                <div className="px-4 py-2 text-xs text-muted-foreground italic">{t('products.no_products')}</div>
                              ) : (
                                <div className={`grid ${gridClass} gap-x-2`}>
                                  {catBrands.map(brand => (
                                    <Link
                                      key={brand.id}
                                      to={`/products?category=${cat.slug}&brand=${brand.name}`}
                                      className="block px-4 py-2 text-[12px] font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap uppercase tracking-tight"
                                      onClick={() => setHoveredItem(null)}
                                    >
                                      {translateDynamic(brand.name)}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                          <div className="border-t border-border mt-1 pt-1">
                            <Link
                              to={`/products?category=${cat.slug}`}
                              className="block px-4 py-2 text-[12px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-colors uppercase tracking-widest"
                              onClick={() => setHoveredItem(null)}
                            >
                              {t('header.view_all', { name: '' })} →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </nav>


  </>
  );
};

export default NavBar;
