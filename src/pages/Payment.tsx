import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';
import { CreditCard, ShieldCheck, Wallet, Landmark } from 'lucide-react';

const Payment = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-black uppercase mb-8 border-b-4 border-primary pb-2 inline-block">
          {t('legal.payment.title')}
        </h1>
        
        <div className="prose prose-slate max-w-none space-y-12 text-foreground/80">
          <p className="text-lg font-medium text-foreground">
            {t('legal.payment.intro')}
          </p>

          <section className="bg-muted/30 p-8 rounded-2xl border-2 border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary rounded-xl">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight m-0">
                {t('legal.payment.stripe.title')}
              </h2>
            </div>
            <p className="leading-relaxed text-lg">
              {t('legal.payment.stripe.content')}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground uppercase tracking-tight m-0">
                  {t('legal.payment.methods.title')}
                </h3>
              </div>
              <ul className="list-none space-y-3 p-0 m-0">
                {(t('legal.payment.methods.list', { returnObjects: true }) as string[]).map((method, index) => (
                  <li key={index} className="flex items-center gap-3 font-medium bg-card border p-3 rounded-lg shadow-sm">
                    <div className="h-2 w-2 bg-primary rounded-full shrink-0" />
                    {method}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Landmark className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground uppercase tracking-tight m-0">
                  {t('legal.payment.security.title')}
                </h3>
              </div>
              <div className="bg-card border p-6 rounded-xl shadow-sm space-y-4">
                <p className="leading-relaxed m-0">
                  {t('legal.payment.security.content')}
                </p>
                <div className="flex gap-4">
                  <div className="p-2 bg-muted rounded flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div className="p-2 bg-muted rounded flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                    <Wallet className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          <div className="mt-12 p-6 border-t border-border text-center text-sm italic">
            {t('legal.last_updated')}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
