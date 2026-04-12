import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProductReviews, useSubmitReview } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { MOCK_REVIEWS, getRandomSubset } from '@/lib/mock-reviews';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { t } = useTranslation();
  const { data: dbReviews, isLoading } = useProductReviews(productId);
  const submitReview = useSubmitReview();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [quote, setQuote] = useState('');

  // Combine real reviews with random mock reviews (3 to 5 total)
  const reviews = useMemo(() => {
    if (isLoading) return [];
    
    const realReviews = dbReviews || [];
    if (realReviews.length >= 5) return realReviews;

    const neededCount = Math.max(3, 5 - realReviews.length);
    const mockSubset = getRandomSubset(MOCK_REVIEWS, 3, 5, productId);
    
    // Add IDs to mock reviews for key mapping
    const formattedMock = mockSubset.map((m, i) => ({
      ...m,
      id: `mock-${productId}-${i}`,
      product_id: productId,
      created_at: new Date().toISOString(),
      is_approved: true
    }));

    return [...realReviews, ...formattedMock].slice(0, 5);
   }, [dbReviews, isLoading, productId]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!author || !quote) {
       toast.error(t('reviews.fill_required'));
       return;
     }

     try {
       await submitReview.mutateAsync({
         product_id: productId,
         rating,
         author,
         location: location || null,
         quote,
       });
       
       toast.success(t('reviews.submit_success'));
       setIsFormOpen(false);
       setAuthor('');
       setLocation('');
       setQuote('');
       setRating(5);
     } catch (error) {
       toast.error(t('reviews.submit_error'));
     }
   };

   const averageRating = reviews?.length 
    ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase text-foreground flex items-center gap-3">
            {t('reviews.title', 'Customer Reviews')}
            {reviews && reviews.length > 0 && (
              <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                {reviews.length}
              </span>
            )}
          </h2>
          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {averageRating.toFixed(1)} {t('reviews.out_of_5', 'out of 5')}
              </span>
            </div>
          )}
        </div>
        
        <Button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="font-bold uppercase tracking-widest"
        >
          {isFormOpen ? t('reviews.cancel', 'Cancel') : t('reviews.write_review', 'Write a Review')}
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-muted/30 p-6 rounded-xl border border-border mb-8 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">{t('reviews.rating', 'Rating')}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`h-8 w-8 ${(hoveredRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">{t('reviews.name', 'Name')} *</label>
                <Input 
                  value={author} 
                  onChange={(e) => setAuthor(e.target.value)} 
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">{t('reviews.location', 'Location')} (Optional)</label>
                <Input 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="Paris, France"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">{t('reviews.review', 'Your Review')} *</label>
              <Textarea 
                value={quote} 
                onChange={(e) => setQuote(e.target.value)} 
                placeholder={t('reviews.placeholder', 'Tell us about your experience with this product...')}
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={submitReview.isPending} className="w-full sm:w-auto font-bold uppercase tracking-widest">
              {submitReview.isPending ? t('reviews.submitting', 'Submitting...') : t('reviews.submit', 'Submit Review')}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 italic">
              {t('reviews.approval_notice', 'Note: Reviews are subject to approval before appearing on the site.')}
            </p>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-6 italic">"{review.quote}"</p>
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {review.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{review.author}</p>
                  {review.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {review.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
          <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">{t('reviews.no_reviews', 'No reviews yet')}</h3>
          <p className="text-muted-foreground text-sm mb-6">{t('reviews.be_first', 'Be the first to review this product!')}</p>
          <Button 
            variant="outline" 
            onClick={() => setIsFormOpen(true)}
            className="font-bold uppercase tracking-widest"
          >
            {t('reviews.write_review', 'Write a Review')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;