import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-black uppercase mb-8 border-b-4 border-primary pb-2 inline-block">
          {t('legal.terms.title')}
        </h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.terms.intro.title')}</h2>
            <p>{t('legal.terms.intro.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.terms.products.title')}</h2>
            <p>{t('legal.terms.products.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.terms.warranty.title')}</h2>
            <p>{t('legal.terms.warranty.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.terms.shipping.title')}</h2>
            <p>{t('legal.terms.shipping.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.terms.payment.title')}</h2>
            <p>{t('legal.terms.payment.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.terms.liability.title')}</h2>
            <p>{t('legal.terms.liability.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.terms.contact.title')}</h2>
            <p>{t('legal.terms.contact.content')}</p>
            <p className="mt-2">
              <strong>Email:</strong> info@enginemarkets.com<br />
              <strong>Phone:</strong> +1 612 293 1250<br />
              <strong>Address:</strong> 30 E 7th St, St Paul, MN 55101
            </p>
          </section>

          <p className="text-sm italic mt-8">{t('legal.last_updated')}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
