import Layout from '@/components/layout/Layout';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-black uppercase mb-8 border-b-4 border-primary pb-2 inline-block">
          {t('legal.about.title')}
        </h1>
        
        <div className="prose prose-slate max-w-none space-y-8 text-foreground/80">
          <p className="text-lg leading-relaxed font-medium text-foreground">
            {t('legal.about.intro')}
          </p>

          <section>
            <h2 className="text-2xl font-bold text-foreground uppercase tracking-tight mb-4">
              {t('legal.about.history.title')}
            </h2>
            <p className="leading-relaxed">
              {t('legal.about.history.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground uppercase tracking-tight mb-4">
              {t('legal.about.mission.title')}
            </h2>
            <p className="leading-relaxed">
              {t('legal.about.mission.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground uppercase tracking-tight mb-4">
              {t('legal.about.expertise.title')}
            </h2>
            <p className="leading-relaxed">
              {t('legal.about.expertise.content')}
            </p>
          </section>

          <div className="bg-muted/50 p-6 rounded-xl border-2 border-dashed border-primary/20 mt-12">
            <h3 className="text-xl font-bold text-foreground uppercase mb-2">Visit Our Main Office</h3>
            <p>30 E 7th St, St Paul, MN 55101</p>
            <p className="text-sm text-muted-foreground mt-1">Serving major cities including Minneapolis, Rochester, and the surrounding areas.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
