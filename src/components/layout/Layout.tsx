import { useEffect, Suspense, lazy } from 'react';
import TopBar from './TopBar';
import Footer from './Footer';
import { MessageCircle } from 'lucide-react';

const MainHeader = lazy(() => import('./MainHeader'));
const NavBar = lazy(() => import('./NavBar'));

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  structuredData?: Record<string, unknown>;
}

const Layout = ({ children, title, description, structuredData }: LayoutProps) => {
  useEffect(() => {
    const baseTitle = "Engine Markets | Premium Used Auto Parts";
    if (title) {
      document.title = `${title} | Engine Markets`;
    } else {
      document.title = baseTitle;
    }

    // Update meta description dynamically if provided
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      <TopBar />
      <Suspense fallback={<div className="h-10 flex items-center justify-center text-primary">Loading navigation...</div>}>
        <MainHeader />
        <NavBar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/16122931250" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group flex items-center gap-2"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 fill-current" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">
          Chat with us
        </span>
      </a>
    </div>
  );
};

export default Layout;
