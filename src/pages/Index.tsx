import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts, useBrands } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Truck, RefreshCcw, Lock, Wrench, Headphones } from 'lucide-react';

const MODEL_OPTIONS: Record<string, string[]> = {
  BMW: ['1 Series', '3 Series', '5 Series', 'X3', 'X5'],
  Audi: ['A3', 'A4', 'A6', 'Q5', 'Q7'],
  Mercedes: ['A-Class', 'C-Class', 'E-Class', 'Sprinter', 'Vito'],
  Volkswagen: ['Golf', 'Passat', 'Tiguan', 'Touran', 'Transporter'],
  Ford: ['Fiesta', 'Focus', 'Mondeo', 'Transit', 'Ranger'],
  Toyota: ['Corolla', 'Hilux', 'Avensis', 'Land Cruiser', 'Yaris'],
  Renault: ['Clio', 'Megane', 'Trafic', 'Kangoo', 'Master'],
  Peugeot: ['208', '308', '3008', 'Partner', 'Boxer'],
  Nissan: ['Qashqai', 'Navara', 'X-Trail', 'Juke', 'Primastar'],
};

const DEFAULT_MODELS = ['Select Model', 'Hilux', 'Golf', 'Transit', 'Qashqai', 'A3'];

const reviewCards = [
  { author: 'James T.', quote: 'Engine arrived exactly as described and was fitted the same week.' },
  { author: 'Marta R.', quote: 'Fast communication, tested part, and shipping to Spain was smooth.' },
  { author: 'Ahmed K.', quote: 'They helped confirm compatibility before I ordered. Very reliable team.' },
];

const trustItems = [
  { icon: Wrench, text: 'Every Part Tested' },
  { icon: Truck, text: 'Worldwide Shipping' },
  { icon: RefreshCcw, text: '60-Day Returns' },
  { icon: Lock, text: 'Secure Payment' },
  { icon: ShieldCheck, text: '15+ Years Experience' },
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const filters = useMemo(() => ({ 
    per_page: 16,
    sort: 'newest' as const
  }), []);

  const { data, isLoading, error } = useProducts(filters);
  const { data: brands } = useBrands();

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 31 }, (_, index) => String(currentYear - index));
  }, []);

  const modelOptions = useMemo(() => {
    if (!selectedMake) return DEFAULT_MODELS;
    return ['Select Model', ...(MODEL_OPTIONS[selectedMake] || ['Engine', 'Gearbox', 'Turbo', 'Cylinder Head'])];
  }, [selectedMake]);

  const handleFindPart = (e: React.FormEvent) => {
    e.preventDefault();

    const query = [selectedMake, selectedModel, selectedYear]
      .filter(value => value && !value.startsWith('Select'))
      .join(' ');

    if (!query) {
      navigate('/products');
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <Layout title="Quality Used Engine Parts">
      <div className="bg-background min-h-screen">
        <section className="bg-[#d4af37] text-[#1b1b1b] border-b border-[#c69f22]">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="max-w-5xl mx-auto rounded-2xl border border-black/5 bg-white/30 backdrop-blur-md px-5 py-5 md:px-8 md:py-6 shadow-xl">
              <div className="max-w-3xl text-center md:text-left">
                <p className="text-[#1b1b1b] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.24em] opacity-70">
                  Tested Parts. Global Delivery.
                </p>
                <h1 className="mt-1 text-xl md:text-3xl font-black leading-tight text-[#1b1b1b]">
                  Quality Used Engine Parts - Tested &amp; Guaranteed
                </h1>
                <p className="mt-1 text-[11px] md:text-xs text-[#1b1b1b]/80 max-w-2xl font-medium">
                  Find trusted engines, gearboxes and parts backed by expert support.
                </p>
              </div>

              <form onSubmit={handleFindPart} className="mt-4 grid grid-cols-1 md:grid-cols-[1.2fr_1.2fr_0.8fr_auto] gap-2">
                <select
                  value={selectedMake}
                  onChange={e => {
                    setSelectedMake(e.target.value);
                    setSelectedModel('');
                  }}
                  className="h-10 rounded-full border border-black/10 bg-white/95 px-4 text-xs font-medium text-[#1b1b1b] focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  <option value="">Select Make</option>
                  {(brands || []).map(brand => (
                    <option key={brand.id} value={brand.name}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="h-10 rounded-full border border-black/10 bg-white/95 px-4 text-xs font-medium text-[#1b1b1b] focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  {modelOptions.map(model => (
                    <option key={model} value={model === 'Select Model' ? '' : model}>
                      {model}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="h-10 rounded-full border border-black/10 bg-white/95 px-4 text-xs font-medium text-[#1b1b1b] focus:outline-none focus:ring-2 focus:ring-black/20"
                >
                  <option value="">Select Year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  className="h-10 rounded-full bg-[#1b1b1b] px-6 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#333333] shadow-lg"
                >
                  Find My Part
                </Button>
              </form>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-[#f8f4ea]">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap justify-center md:grid md:grid-cols-5 gap-2 md:gap-3">
              {trustItems.map(item => (
                <div key={item.text} className="flex items-center gap-1.5 rounded-full border border-[#e4d5b0] bg-white px-3 py-2 text-center text-[10px] md:text-xs font-bold text-[#1b1b1b] shadow-sm whitespace-nowrap">
                  <item.icon className="h-3.5 w-3.5 text-[#b38a2e] shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col gap-2 mb-6">
            <p className="text-[#b38a2e] text-[10px] font-bold uppercase tracking-[0.24em]">
              Ready to ship inventory
            </p>
            <h2 className="text-xl md:text-2xl font-black uppercase text-foreground">
              Latest Tested Parts
            </h2>
          </div>

          <ProductGrid products={data?.products || []} loading={isLoading} />

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              We could not load the latest products right now. Please try again shortly.
            </div>
          )}
        </div>

        <section className="bg-[#f4efe2] border-y border-[#e4d8bc]">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <p className="text-[#b38a2e] text-xs font-semibold uppercase tracking-[0.24em]">
                Social Proof
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-black uppercase text-foreground">
                Trusted by buyers around the world
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {reviewCards.map(review => (
                <div key={review.author} className="rounded-3xl border border-[#e4d8bc] bg-white p-6 shadow-sm">
                  <div className="text-[#d4af37] text-lg tracking-[0.2em]">★★★★★</div>
                  <p className="mt-4 text-foreground font-medium leading-relaxed">&ldquo;{review.quote}&rdquo;</p>
                  <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">{review.author}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl bg-[#151515] px-6 py-6 text-center text-white shadow-lg">
              <div className="grid md:grid-cols-3 gap-4 text-xl md:text-2xl font-black uppercase">
                <div>15+ Years in Business</div>
                <div>10,000+ Parts Sold</div>
                <div>80+ Countries Served</div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-sm">
            <div className="max-w-2xl mb-8">
              <p className="text-[#b38a2e] text-xs font-semibold uppercase tracking-[0.24em]">
                Buy with confidence
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-black uppercase text-foreground">
                Why buyers choose EngineMarkets
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              <div className="rounded-2xl border border-border bg-[#faf8f2] p-5">
                <Wrench className="h-8 w-8 text-[#b38a2e]" />
                <h3 className="mt-4 text-lg font-bold text-foreground">Every part is tested before shipping</h3>
                <p className="mt-2 text-sm text-muted-foreground">Each order is checked and inspected to reduce risk and help customers buy with more confidence.</p>
              </div>
              <div className="rounded-2xl border border-border bg-[#faf8f2] p-5">
                <Lock className="h-8 w-8 text-[#b38a2e]" />
                <h3 className="mt-4 text-lg font-bold text-foreground">Safe &amp; secure checkout guaranteed</h3>
                <p className="mt-2 text-sm text-muted-foreground">Customers see strong payment reassurance before they commit, helping improve conversion on high-value orders.</p>
              </div>
              <div className="rounded-2xl border border-border bg-[#faf8f2] p-5">
                <Headphones className="h-8 w-8 text-[#b38a2e]" />
                <h3 className="mt-4 text-lg font-bold text-foreground">Expert support before and after your order</h3>
                <p className="mt-2 text-sm text-muted-foreground">Shoppers can quickly ask for guidance on fitment, condition, shipping and ordering before checkout.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
