import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  name: string;
}

const ImageGallery = ({ images, name }: ImageGalleryProps) => {
  const [selected, setSelected] = useState(0);
  const displayImages = images.length ? images : ['/placeholder.svg'];
  const currentImage = displayImages[selected];
  
  // Encode URL to prevent srcset parsing warnings
  const encodedImage = encodeURI(currentImage).replace(/%25/g, '%');
  const webpUrl = encodedImage.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  return (
    <div className="space-y-3">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
        <picture>
          <source srcSet={webpUrl} type="image/webp" />
          <img
            src={encodedImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        </picture>
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((img, i) => {
            const encodedThumb = encodeURI(img).replace(/%25/g, '%');
            const thumbWebp = encodedThumb.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 transition-colors ${
                  i === selected ? 'border-primary' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <picture>
                  <source srcSet={thumbWebp} type="image/webp" />
                  <img src={encodedThumb} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
                </picture>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
