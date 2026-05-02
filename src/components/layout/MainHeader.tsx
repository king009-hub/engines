import { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, ChevronRight, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { useCategories, useBrands } from '@/hooks/useProducts';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '@/lib/translate';

const MainHeader = memo(() => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="bg-[#f6f3eb] border-b border-[#ddd3bf]">
      <div className="container mx-auto px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between gap-6 py-2">
          {/* Logo Section - Compact and combined */}
          <div className="flex items-center gap-4 shrink-0">
            <Link to="/" className="flex items-center gap-3 relative group">
              <picture className="h-[50px] w-auto flex items-center">
                <source srcSet="/images-optimized/logo.webp" type="image/webp" />
                <img 
                  src="/images-optimized/logo.png" 
                  alt="Logo" 
                  className="h-full w-auto object-contain"
                />
              </picture>
              <div className="h-8 w-px bg-[#ddd3bf]" />
              <picture className="h-[28px] w-auto flex items-center">
                <source srcSet="/images-optimized/header.webp" type="image/webp" />
                <img 
                  src="/images-optimized/header.jpg" 
                  alt="ENGINE MARKETS" 
                  className="h-full w-auto object-contain"
                />
              </picture>
              
              {/* Floating Discount Badge */}
              <div className="absolute -top-1 -right-4 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white animate-bounce">
                -30%
              </div>
            </Link>
          </div>

          {/* Search - More compact */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center justify-center max-w-xl">
            <div className="relative w-full flex max-w-[400px]">
              <input
                type="text"
                placeholder={t('header.search_placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-[#c9b48b] bg-white h-[38px] px-4 text-[13px] rounded-l-full focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 shadow-sm"
              />
              <button
                type="submit"
                className="h-[38px] w-[46px] flex items-center justify-center bg-[#1f1f1f] hover:bg-[#111111] text-white shrink-0 rounded-r-full transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {/* Right side - Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:flex flex-col items-end -space-y-1 mr-2">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Summer Sale</span>
              <span className="text-[14px] font-black text-[#1b1b1b] uppercase tracking-tighter">30% OFF ALL</span>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center px-5 py-2 bg-[#d4af37] hover:bg-[#c69f22] text-[#1b1b1b] font-bold uppercase text-[12px] tracking-wide rounded-full shadow-sm transition-colors"
            >
              Get a Quote
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6a6a6a] hidden lg:block">{t('header.basket')}</span>
              <Link to="/cart" className="relative">
                <div className="border-2 border-[#d4af37] rounded-full w-[36px] h-[36px] flex items-center justify-center bg-white shadow-sm hover:scale-105 transition-transform">
                  <span className="text-[#b38a2e] text-[14px] font-bold">
                    {totalItems}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile - visible on screens smaller than 768px */}
        <div className="md:hidden flex items-center justify-between py-2 gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-1.5 text-foreground hover:bg-white rounded-md transition-colors border border-[#d8cfbc] bg-white/70" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col bg-[#f6f3eb]">
              <SheetHeader className="sr-only">
                <SheetTitle>Mobile Menu</SheetTitle>
                <SheetDescription>Navigation for mobile users</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-[#ddd3bf] bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
                  <form onSubmit={handleSearch} className="flex-1 flex items-center">
                    <div className="relative w-full flex">
                      <input
                        type="text"
                        placeholder={t('header.search_placeholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full border border-[#c9b48b] bg-white h-[38px] px-4 text-[14px] rounded-l-full focus:outline-none focus:border-primary transition-colors"
                      />
                      <button
                        type="submit"
                        className="h-[38px] w-[38px] flex items-center justify-center bg-[#1f1f1f] hover:bg-[#111111] text-white shrink-0 transition-colors rounded-r-full"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="p-0">
                  {categoriesLoading ? (
                    <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#b38a2e]" /></div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {categories?.filter(c => !c.parent_id).map((cat) => (
                        <AccordionItem key={cat.id} value={cat.id} className="border-b border-gray-300 bg-white">
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/products?category=${cat.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex-1 px-4 py-3 text-[13px] font-medium uppercase tracking-tight text-foreground"
                            >
                              {translateDynamic(cat.name)}
                            </Link>
                            <AccordionTrigger className="w-12 h-[48px] p-0 flex items-center justify-center hover:no-underline border-l border-gray-100 [&[data-state=open]>svg]:rotate-180">
                            </AccordionTrigger>
                          </div>
                          <AccordionContent className="p-0 bg-white">
                              <div className="flex flex-col">
                                {/* Engines specific layout */}
                                {cat.slug === 'engines' ? (
                                  <Accordion type="single" collapsible className="w-full">
                                    {[
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
                                    ].map((col, idx) => (
                                      <AccordionItem key={idx} value={`engine-${idx}`} className="border-b border-gray-100 last:border-0">
                                        <div className="flex items-center justify-between bg-gray-50/50">
                                          <Link 
                                            to={`/products?category=engines&fuel_type=${col.fuel}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1 px-8 py-3 text-[12px] font-black uppercase tracking-tighter text-foreground"
                                          >
                                            {col.title}
                                          </Link>
                                          <AccordionTrigger className="w-10 h-[44px] p-0 flex items-center justify-center hover:no-underline border-l border-gray-100/50" />
                                        </div>
                                        <AccordionContent className="p-0 bg-white">
                                          <div className="flex flex-col">
                                            {col.items.map((item, itemIdx) => {
                                              const brandsQuery = item.brands ? `&brand=${item.brands.join(',')}` : '';
                                              return (
                                                <Link
                                                  key={itemIdx}
                                                  to={`/products?category=engines&fuel_type=${col.fuel}${brandsQuery}`}
                                                  onClick={() => setMobileMenuOpen(false)}
                                                  className="px-12 py-2.5 text-[12px] text-[#444] border-b border-gray-50 last:border-0 hover:bg-gray-50 flex items-center justify-between uppercase tracking-tight"
                                                >
                                                  {item.name}
                                                  <ChevronRight className="h-3 w-3 opacity-20" />
                                                </Link>
                                              );
                                            })}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                  </Accordion>
                                ) : cat.slug === 'engine-parts' ? (
                                  <Accordion type="single" collapsible className="w-full">
                                    {[
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
                                    ].map((col, idx) => (
                                      <AccordionItem key={idx} value={`engine-part-${idx}`} className="border-b border-gray-100 last:border-0">
                                        <div className="flex items-center justify-between bg-gray-50/50">
                                          <Link 
                                            to={`/products?category=${col.slug || 'engine-parts'}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1 px-8 py-3 text-[12px] font-black uppercase tracking-tighter text-foreground"
                                          >
                                            {col.title}
                                          </Link>
                                          <AccordionTrigger className="w-10 h-[44px] p-0 flex items-center justify-center hover:no-underline border-l border-gray-100/50" />
                                        </div>
                                        <AccordionContent className="p-0 bg-white">
                                          <div className="flex flex-col">
                                            {col.items.map((item, itemIdx) => {
                                              const brandsQuery = item.brands ? `&brand=${item.brands.join(',')}` : '';
                                              const targetSlug = item.slug || col.slug;
                                              return (
                                                <Link
                                                  key={itemIdx}
                                                  to={`/products?category=${targetSlug}${brandsQuery}`}
                                                  onClick={() => setMobileMenuOpen(false)}
                                                  className="px-12 py-2.5 text-[12px] text-[#444] border-b border-gray-50 last:border-0 hover:bg-gray-50 flex flex-col uppercase tracking-tight"
                                                >
                                                  <span className="font-semibold">{item.name}</span>
                                                  {item.subTitle && (
                                                    <span className="text-[10px] opacity-60 font-normal italic">{item.subTitle}</span>
                                                  )}
                                                </Link>
                                              );
                                            })}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                  </Accordion>
                                ) : cat.slug === 'gearboxes' ? (
                                  <Accordion type="single" collapsible className="w-full">
                                    {[
                                      {
                                        title: 'USED AUTOMATIC',
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
                                    ].map((col, idx) => (
                                      <AccordionItem key={idx} value={`gearbox-${idx}`} className="border-b border-gray-100 last:border-0">
                                        <div className="flex items-center justify-between bg-gray-50/50">
                                          <Link 
                                            to={`/products?category=gearboxes`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1 px-8 py-3 text-[12px] font-black uppercase tracking-tighter text-foreground"
                                          >
                                            {col.title}
                                          </Link>
                                          <AccordionTrigger className="w-10 h-[44px] p-0 flex items-center justify-center hover:no-underline border-l border-gray-100/50" />
                                        </div>
                                        <AccordionContent className="p-0 bg-white">
                                          <div className="flex flex-col">
                                            {col.items.map((item, itemIdx) => {
                                              const brandsQuery = item.brands ? `&brand=${item.brands.join(',')}` : '';
                                              return (
                                                <Link
                                                  key={itemIdx}
                                                  to={`/products?category=gearboxes${brandsQuery}`}
                                                  onClick={() => setMobileMenuOpen(false)}
                                                  className="px-12 py-2.5 text-[12px] text-[#444] border-b border-gray-50 last:border-0 hover:bg-gray-50 flex items-center justify-between uppercase tracking-tight"
                                                >
                                                  {item.name}
                                                  <ChevronRight className="h-3 w-3 opacity-20" />
                                                </Link>
                                              );
                                            })}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                  </Accordion>
                                ) : (
                                  <Accordion type="single" collapsible className="w-full">
                                    {categories?.filter(sub => sub.parent_id === cat.id).map(sub => (
                                      <AccordionItem key={sub.id} value={sub.id} className="border-b border-gray-100 last:border-0">
                                        <div className="flex items-center justify-between bg-gray-50/50">
                                          <Link 
                                            to={`/products?category=${sub.slug}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1 px-8 py-3 text-[12px] font-black uppercase tracking-tighter text-foreground"
                                          >
                                            {translateDynamic(sub.name)}
                                          </Link>
                                          <AccordionTrigger className="w-10 h-[44px] p-0 flex items-center justify-center hover:no-underline border-l border-gray-100/50" />
                                        </div>
                                        <AccordionContent className="p-0 bg-white">
                                          <div className="flex flex-col">
                                            {brands?.filter(brand => sub.brand_ids?.includes(brand.id)).map(brand => (
                                              <Link
                                                key={brand.id}
                                                to={`/products?category=${sub.slug}&brand=${brand.name}`}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="px-12 py-2.5 text-[12px] text-[#444] border-b border-gray-50 last:border-0 hover:bg-gray-50 flex items-center justify-between uppercase tracking-tight"
                                              >
                                                {translateDynamic(brand.name)}
                                                <ChevronRight className="h-3 w-3 opacity-20" />
                                              </Link>
                                            ))}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                  </Accordion>
                                )}

                                {/* Direct brands if no subcategories and not special case */}
                                {!categories?.some(sub => sub.parent_id === cat.id) && !['engines', 'engine-parts', 'gearboxes'].includes(cat.slug) && (
                                  <div className="flex flex-col">
                                    {brands?.filter(brand => cat.brand_ids?.includes(brand.id)).map(brand => (
                                      <Link
                                        key={brand.id}
                                        to={`/products?category=${cat.slug}&brand=${brand.name}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-8 py-3 text-[13px] text-[#333] border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-between uppercase tracking-tight"
                                      >
                                        {translateDynamic(brand.name)}
                                        <ChevronRight className="h-3 w-3 opacity-30" />
                                      </Link>
                                    ))}
                                  </div>
                                )}

                                {/* Link to all products in this main category */}
                                <Link
                                  to={`/products?category=${cat.slug}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="px-8 py-4 text-[13px] font-black uppercase text-[#b38a2e] bg-white hover:bg-gray-50 transition-colors flex items-center justify-between border-t border-gray-200 mt-2"
                                >
                                  {t('header.view_all', { name: translateDynamic(cat.name) })}
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </div>
                            </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>

                <div className="p-4 space-y-6 mt-4">
                  <div className="flex items-center justify-center py-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <picture className="h-[60px] w-auto flex items-center justify-center">
                      <source srcSet="/images-optimized/logo.webp" type="image/webp" />
                      <img 
                        src="/images-optimized/logo.png" 
                        alt="Logo" 
                        className="h-full w-full object-contain"
                      />
                    </picture>
                  </div>
                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full py-4 bg-[#d4af37] text-[#1b1b1b] font-bold uppercase text-[13px] tracking-widest rounded-full shadow-md active:scale-[0.98] transition-all"
                  >
                    Get a Quote
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center justify-center flex-1 px-3 overflow-hidden">
            <picture className="h-[35px] xs:h-[40px] sm:h-[45px] w-auto max-w-full flex items-center justify-center">
              <source srcSet="/images-optimized/header.webp" type="image/webp" />
              <img 
                src="/images-optimized/header.jpg" 
                alt="ENGINE MARKETS" 
                className="h-full w-full object-contain"
              />
            </picture>
          </Link>
          <Link to="/cart" className="relative p-1.5 hover:bg-white rounded-full transition-colors border border-[#d8cfbc] bg-white/70">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <span className="absolute top-0 right-0 border-2 border-white text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center bg-primary rounded-full shadow-sm">
              {totalItems}
            </span>
          </Link>
          <div className="flex flex-col items-center -space-y-1">
            <span className="text-[8px] font-black text-red-600 uppercase">30%</span>
            <span className="text-[8px] font-black text-[#1b1b1b] uppercase">OFF</span>
          </div>
        </div>

        <div className="pb-2 md:hidden">
          <div className="rounded-full border border-[#d8cfbc] bg-[#1b1b1b] px-3 py-1.5 text-center text-[10px] font-semibold tracking-wide text-white shadow-sm">
            Trusted Since 2009 | Worldwide Shipping | Tested Parts
          </div>
        </div>
      </div>
    </div>
  );
});

MainHeader.displayName = 'MainHeader';

export default MainHeader;
