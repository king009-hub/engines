import { Link } from 'react-router-dom';
import { Settings, Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* The Society */}
          <div>
            <h3 className="text-primary font-bold uppercase text-sm mb-4 tracking-wider">{t('footer.society')}</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link to="/about" className="hover:text-primary transition-colors">{t('footer.who_we_are')}</Link></li>
              <li><Link to="/payment" className="hover:text-primary transition-colors">{t('footer.payment_methods')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          {/* Access Customers */}
          <div>
            <h3 className="text-primary font-bold uppercase text-sm mb-4 tracking-wider">{t('footer.access_customers')}</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link to="/login" className="hover:text-primary transition-colors">{t('footer.my_account')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('footer.quotes')}</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-primary font-bold uppercase text-sm mb-4 tracking-wider">{t('footer.information')}</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link></li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-black uppercase text-sm">{t('footer.company_info')}</p>
                <p className="text-primary font-bold text-xs">{t('footer.since')}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-secondary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>30 E 7th St, St Paul, MN 55101</span>
              </div>
              <div className="text-xs text-secondary-foreground/50 ml-6">
                Major Cities: Minneapolis, St. Paul, Rochester
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="https://wa.me/16122931250" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>+1 612 293 1250</span>
                  <span className="text-[10px] bg-[#25D366] text-white px-1.5 rounded-full font-bold">WA</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>info@enginemarkets.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-secondary-foreground/50">
          © {new Date().getFullYear()} {t('footer.company_info')}. {t('footer.rights_reserved')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
