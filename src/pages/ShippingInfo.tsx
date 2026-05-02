import Layout from '@/components/layout/Layout';
import { Globe, PackageCheck, Shield, Truck } from 'lucide-react';

const ShippingInfo = () => {
  return (
    <Layout title="Shipping Info">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-[#b38a2e] text-xs font-semibold uppercase tracking-[0.24em]">Shipping Info</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-black uppercase text-foreground">
            Fast dispatch for tested used parts
          </h1>
          <p className="mt-4 text-muted-foreground">
            EngineMarkets ships tested engines, gearboxes and auto parts worldwide. Most stocked items leave within 48 hours, with careful packaging and clear support before dispatch.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <Truck className="h-8 w-8 text-[#b38a2e]" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Dispatch Times</h2>
            <p className="mt-2 text-muted-foreground">
              Most in-stock parts are prepared and dispatched within 24 to 48 hours. Larger items may require extra handling time to ensure safe transport.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <Globe className="h-8 w-8 text-[#b38a2e]" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Worldwide Coverage</h2>
            <p className="mt-2 text-muted-foreground">
              We serve customers across Europe, the Middle East, Africa and beyond. Shipping times vary by destination and courier availability.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <PackageCheck className="h-8 w-8 text-[#b38a2e]" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Packaging Standards</h2>
            <p className="mt-2 text-muted-foreground">
              Parts are checked, labelled and packed for transit protection. Engines and gearboxes are secured for freight shipment where required.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <Shield className="h-8 w-8 text-[#b38a2e]" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Order Support</h2>
            <p className="mt-2 text-muted-foreground">
              Need help before ordering? Contact us with your vehicle details and our team will help confirm fitment and delivery expectations.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingInfo;
