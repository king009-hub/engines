import Layout from '@/components/layout/Layout';
import { BadgeCheck, RefreshCcw, ShieldCheck, Wrench } from 'lucide-react';

const Returns = () => {
  return (
    <Layout title="Return Policy">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-[#b38a2e] text-xs font-semibold uppercase tracking-[0.24em]">Return Policy</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-black uppercase text-foreground">
            Clear returns guidance for confident buying
          </h1>
          <p className="mt-4 text-muted-foreground">
            We want customers to order with confidence. If there is an issue with the condition or supplied item, contact our team promptly so we can review the order and support the next step.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <RefreshCcw className="h-8 w-8 text-[#b38a2e]" />
            <h2 className="mt-4 text-xl font-bold text-foreground">60-Day Returns Guidance</h2>
            <p className="mt-2 text-muted-foreground">
              Contact us as soon as possible if a delivered item is not as expected. Our team will review the case and explain the return steps available for your order.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <BadgeCheck className="h-8 w-8 text-[#b38a2e]" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Tested Before Dispatch</h2>
            <p className="mt-2 text-muted-foreground">
              Because parts are checked before shipping, we can discuss issues with clearer records and help customers faster when support is needed.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <Wrench className="h-8 w-8 text-[#b38a2e]" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Fitment Matters</h2>
            <p className="mt-2 text-muted-foreground">
              Always confirm compatibility before installation. If you are unsure, message us before ordering and we will help verify the correct part for your vehicle.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <ShieldCheck className="h-8 w-8 text-[#b38a2e]" />
            <h2 className="mt-4 text-xl font-bold text-foreground">Support First</h2>
            <p className="mt-2 text-muted-foreground">
              The fastest route is to contact EngineMarkets directly with your order number, vehicle details and photos if relevant. We will guide you from there.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Returns;
