import { useState, useMemo } from 'react';
import { getOptimizedImageUrl } from '@/lib/image-utils';

interface ImageGalleryProps {
  images: string[];
  name: string;
}

const ImageGallery = ({ images, name }: ImageGalleryProps) => {
  const [selected, setSelected] = useState(0);
  const displayImages = images.length ? images : ['/placeholder.svg'];
  
  const optimizedMain = useMemo(() => 
    getOptimizedImageUrl(displayImages[selected], { width: 800, quality: 80 }), 
  [displayImages, selected]);

  return (
    <div className="space-y-3">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
        <img
          src={optimizedMain}
          alt={name}
          className="w-full h-full object-cover"
          loading="eager"
          decoding="sync"
        />
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((img, i) => {
            const thumbUrl = getOptimizedImageUrl(img, { width: 100, height: 100, quality: 60 });
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 transition-colors ${
                  i === selected ? 'border-primary' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <img 
                  src={thumbUrl} 
                  alt={`${name} ${i + 1}`} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
