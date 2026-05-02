import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Phone, Mail, MapPin, CreditCard, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = memo(() => {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#161616] text-white">
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-5 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
              <span className="font-semibold">Secure Payment</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <CreditCard className="h-4 w-4 text-[#d4af37]" />
              <span className="font-semibold">Visa</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <CreditCard className="h-4 w-4 text-[#d4af37]" />
              <span className="font-semibold">Mastercard</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <CreditCard className="h-4 w-4 text-[#d4af37]" />
              <span className="font-semibold">PayPal</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            <Link to="/returns" className="hover:text-[#d4af37] transition-colors inline-flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Return Policy
            </Link>
            <Link to="/shipping-info" className="hover:text-[#d4af37] transition-colors inline-flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Info
            </Link>
            <Link to="/contact" className="hover:text-[#d4af37] transition-colors inline-flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* The Society */}
          <div>
            <h3 className="text-[#d4af37] font-bold uppercase text-sm mb-4 tracking-wider">{t('footer.society')}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-[#d4af37] transition-colors">{t('footer.who_we_are')}</Link></li>
              <li><Link to="/payment" className="hover:text-[#d4af37] transition-colors">{t('footer.payment_methods')}</Link></li>
              <li><Link to="/contact" className="hover:text-[#d4af37] transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          {/* Access Customers */}
          <div>
            <h3 className="text-[#d4af37] font-bold uppercase text-sm mb-4 tracking-wider">{t('footer.access_customers')}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/login" className="hover:text-[#d4af37] transition-colors">{t('footer.my_account')}</Link></li>
              <li><Link to="/contact" className="hover:text-[#d4af37] transition-colors">{t('footer.quotes')}</Link></li>
              <li><Link to="/returns" className="hover:text-[#d4af37] transition-colors">Return Policy</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-[#d4af37] font-bold uppercase text-sm mb-4 tracking-wider">{t('footer.information')}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/terms" className="hover:text-[#d4af37] transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-[#d4af37] transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/shipping-info" className="hover:text-[#d4af37] transition-colors">Shipping Info</Link></li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-[#161616]" />
              </div>
              <div>
                <p className="font-black uppercase text-sm">{t('footer.company_info')}</p>
                <p className="text-[#d4af37] font-bold text-xs">{t('footer.since')}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#d4af37] shrink-0" />
                <span>30 E 7th St, St Paul, MN 55101</span>
              </div>
              <div className="text-xs text-white/50 ml-6">
                Major Cities: Minneapolis, St. Paul, Rochester
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#d4af37] shrink-0" />
                <a href="https://wa.me/16122931250" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] transition-colors flex items-center gap-1">
                  <span>+1 612 293 1250</span>
                  <span className="text-[10px] bg-[#25D366] text-white px-1.5 rounded-full font-bold">WA</span>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#d4af37] shrink-0" />
                <span>info@enginemarkets.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-white/60">
          © 2009-2026 EngineMarkets - Trusted Auto Parts Worldwide
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
