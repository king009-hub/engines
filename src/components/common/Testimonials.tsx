import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

interface TestimonialData {
  quote: string;
  author: string;
  location: string;
  avatar: string;
  rating: number;
}

interface TestimonialsProps {
  customTestimonials?: TestimonialData[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const Testimonials = ({ customTestimonials, title, subtitle, className }: TestimonialsProps) => {
  const { t } = useTranslation();
  const defaultTestimonials = t('testimonials', { returnObjects: true }) as TestimonialData[];
  const testimonials = customTestimonials || defaultTestimonials;

  return (
    <div className={`bg-gray-50 py-16 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title || t('home.testimonials_title')}
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            {subtitle || t('home.testimonials_subtitle')}
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
          <div className={`-mt-8 sm:-mx-4 ${testimonials.length > 3 ? 'sm:columns-2 lg:columns-3' : 'grid sm:grid-cols-2 lg:grid-cols-3'}`}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="pt-8 sm:inline-block sm:w-full sm:px-4">
                <figure className="rounded-2xl bg-white p-8 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                  <div className="flex items-center gap-x-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-gray-900 italic">
                    <p>{`“${testimonial.quote}”`}</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-x-4">
                    <img className="h-10 w-10 rounded-full bg-gray-50 object-cover" src={testimonial.avatar} alt={testimonial.author} />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-gray-600">{testimonial.location}</div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
