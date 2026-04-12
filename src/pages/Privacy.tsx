import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-black uppercase mb-8 border-b-4 border-primary pb-2 inline-block">
          {t('legal.privacy.title')}
        </h1>
        
        <div className="prose prose-slate max-w-none space-y-6 text-foreground/80">
          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.privacy.collect.title')}</h2>
            <p>{t('legal.privacy.collect.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.privacy.use.title')}</h2>
            <p>{t('legal.privacy.use.content')}</p>
            <ul className="list-disc ml-6 mt-2">
              {(t('legal.privacy.use.list', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.privacy.sharing.title')}</h2>
            <p>{t('legal.privacy.sharing.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.privacy.security.title')}</h2>
            <p>{t('legal.privacy.security.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.privacy.cookies.title')}</h2>
            <p>{t('legal.privacy.cookies.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.privacy.rights.title')}</h2>
            <p>{t('legal.privacy.rights.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">{t('legal.privacy.contact.title')}</h2>
            <p>{t('legal.privacy.contact.content')}</p>
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

export default Privacy;
