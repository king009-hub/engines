import { useEffect } from 'react';

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
    <>
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      {children}
    </>
  );
};

export default Layout;
