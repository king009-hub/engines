import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ImageGallery from '@/components/products/ImageGallery';
import SpecsTable from '@/components/products/SpecsTable';
import RelatedEngines from '@/components/products/RelatedEngines';
import { toast } from 'sonner';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Home, FileText, Youtube, BadgeCheck, Lock, MessageCircle, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { translateDynamic } from '@/lib/translate';
import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { MOCK_TESTIMONIALS, getRandomSubset } from '@/lib/mock-reviews';

// Lazy load heavy components
const ProductReviews = lazy(() => import('@/components/products/ProductReviews'));
const Testimonials = lazy(() => import('@/components/common/Testimonials'));

// Loading skeletons for lazy components
const SectionSkeleton = () => (
  <div className="mt-16 animate-pulse space-y-4">
    <div className="h-8 w-48 bg-muted rounded"></div>
    <div className="h-32 w-full bg-muted rounded"></div>
  </div>
);

const ProductDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: idOrSlug } = useParams<{ id: string }>();
  const { data: product, isLoading: isProductLoading } = useProduct(idOrSlug || '');
  const { data: related, isLoading: isRelatedLoading } = useRelatedProducts(product);
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product?.id]);

  // Generate random testimonials for this product
  const randomTestimonials = useMemo(() => {
    if (!product) return [];
    return getRandomSubset(MOCK_TESTIMONIALS, 3, 7, product.id);
  }, [product]);

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    let videoId = '';
    try {
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
      } else if (url.includes('shorts/')) {
        videoId = url.split('shorts/')[1].split('?')[0];
      }
    } catch (e) {
      return null;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : null;
  };

  const translatedName = product ? translateDynamic(product.name) : t('products.loading');
  const compatibilityRows = useMemo(() => {
    if (!product) return [];

    const rows = (product.compatibility || []).map((item, index) => ({
      id: `${item}-${index}`,
      make: translateDynamic(product.brand) || 'Ask Us',
      model: translateDynamic(item) || 'Ask Us',
      year: product.year?.toString() || 'Ask Us',
    }));

    if (rows.length > 0) {
      return rows;
    }

    return [
      {
        id: 'default-row',
        make: translateDynamic(product.brand) || 'Ask Us',
        model: translatedName,
        year: product.year?.toString() || 'Ask Us',
      }
    ];
  }, [product, translatedName]);
  const metaDescription = product 
    ? `Buy ${translatedName} - ${product.engine_code ? `Engine Code: ${product.engine_code} - ` : ''}High quality auto parts at Engine Markets. Fast delivery.`
    : '';

  const structuredData = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": translatedName,
    "image": product.images || [],
    "description": translateDynamic(product.description) || metaDescription,
    "sku": product.engine_code,
    "brand": {
      "@type": "Brand",
      "name": translateDynamic(product.brand)
    },
    "offers": {
      "@type": "Offer",
      "url": `https://enginemarkets.com/products/${product.slug || product.id}`,
      "priceCurrency": "USD",
      "price": product.price,
      "itemCondition": "https://schema.org/UsedCondition",
      "availability": product.availability ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  } : undefined;

  const handleAddToBasket = () => {
    if (product) {
      addItem(product.id);
      toast.success(t('cart.added_success') || 'Added to basket');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product.id);
      navigate('/checkout');
    }
  };

  return (
    <Layout title={translatedName} description={metaDescription} structuredData={structuredData}>
      {/* Breadcrumb - Stable at top */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary flex items-center gap-1"><Home className="h-3 w-3" /> {t('products.home')}</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary">{t('products.all_products')}</Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-none">
              {isProductLoading && !product ? (
                <Skeleton className="h-4 w-24 inline-block align-middle" />
              ) : (
                translatedName
              )}
            </span>
          </div>
        </div>
      </div>

      {isProductLoading && !product ? (
        <div className="container mx-auto px-4 py-8 min-h-[600px]">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          </div>
        </div>
      ) : !product ? (
        <div className="container mx-auto px-4 py-16 text-center min-h-[400px]">
          <h2 className="text-2xl font-bold text-foreground">{t('products.no_products')}</h2>
          <Button asChild className="mt-4"><Link to="/products">{t('products.view_all', { name: '' })}</Link></Button>
        </div>
      ) : (
        <div key={product.id} className="animate-in fade-in duration-300">
          <div className="container mx-auto px-4 py-8 min-h-[600px]">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <ImageGallery images={product.images || []} name={translatedName} />

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold uppercase text-primary tracking-wider">{translateDynamic(product.brand)} • {translateDynamic(product.fuel_type)}</p>
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Used - Tested &amp; Inspected
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black uppercase text-foreground mt-1">{translatedName}</h1>
                  <p className="text-muted-foreground mt-2">{translateDynamic(product.description)}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-3xl font-black text-primary">
                    ${Math.round(Number(product.price))}
                  </div>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Lock className="h-4 w-4 text-[#b38a2e]" />
                    Secure Checkout
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 text-[#b38a2e]" />
                    Usually ships within 48 hours
                  </p>
                </div>

                <div className="rounded-2xl border border-border overflow-hidden">
                  <div className="bg-[#151515] px-4 py-3">
                    <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Compatibility</h3>
                  </div>
                  <div className="divide-y divide-border">
                    <div className="grid grid-cols-3 bg-muted/40 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      <div className="px-4 py-3">Make</div>
                      <div className="px-4 py-3">Model</div>
                      <div className="px-4 py-3">Year</div>
                    </div>
                    {compatibilityRows.map(row => (
                      <div key={row.id} className="grid grid-cols-3 text-sm">
                        <div className="px-4 py-3 font-semibold text-foreground">{row.make}</div>
                        <div className="px-4 py-3 text-foreground">{row.model}</div>
                        <div className="px-4 py-3 text-muted-foreground">{row.year}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAddToBasket}
                      size="lg"
                      variant="outline"
                      className="font-bold uppercase w-full sm:flex-1 h-12 sm:h-11 border-primary text-primary hover:bg-primary/10"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5 sm:h-4 sm:w-4" /> {t('products.add_to_basket')}
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase w-full sm:flex-1 h-12 sm:h-11"
                    >
                      Buy Now
                    </Button>
                    <Button
                      onClick={() => toggle(product.id)}
                      variant="outline"
                      size="lg"
                      className={`w-full sm:w-auto sm:flex-none h-12 sm:h-11 ${isWishlisted(product.id) ? 'text-red-500 hover:text-red-600 border-red-200 bg-red-50' : ''}`}
                    >
                      <Heart className={`h-6 w-6 sm:h-5 sm:w-5 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
                      <span className="sm:hidden ml-2 font-bold uppercase text-xs">{isWishlisted(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                    </Button>
                  </div>
                  <a
                    href="https://wa.me/16122931250"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1fb45a]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Not sure this fits your car? Ask us
                  </a>
                </div>

                {/* Specs Table */}
                <SpecsTable product={product} />

                <div className="pt-4 border-t border-border">
                  <Button variant="link" className="text-primary font-bold p-0 uppercase text-xs tracking-widest gap-2">
                    <FileText className="h-4 w-4" /> {t('products.request_quote')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Video Test Section */}
            {getYouTubeEmbedUrl(product.youtube_url) && (
              <div className="mt-12 pt-12 border-t border-border">
                <h2 className="text-xl font-black uppercase text-foreground mb-6 flex items-center gap-2">
                  <Youtube className="h-6 w-6 text-red-600" />
                  Video Test
                </h2>
                <div className="max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg border border-border bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(product.youtube_url)!}
                    title={`${translatedName} Video Test`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Product Reviews */}
            <Suspense fallback={<SectionSkeleton />}>
              <ProductReviews productId={product.id} />
            </Suspense>

            {/* Testimonials */}
            <Suspense fallback={<SectionSkeleton />}>
              <Testimonials 
                customTestimonials={randomTestimonials} 
                title="Verified Buyer Testimonials"
                subtitle="See what our customers say about their experience with us."
                className="mt-16 bg-transparent py-0"
              />
            </Suspense>

            {/* Related */}
            <div className="mt-16 min-h-[400px]">
              <h2 className="text-xl font-black uppercase text-foreground mb-6">{t('products.related_products')}</h2>
              {isRelatedLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-square rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : related && related.length > 0 ? (
                <RelatedEngines products={related} />
              ) : (
                <p className="text-muted-foreground text-sm italic">No related products found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductDetail;
