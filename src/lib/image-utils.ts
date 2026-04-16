/**
 * Utility to get optimized image URLs from Supabase storage.
 * Supports resizing, quality adjustment, and format conversion.
 */
export function getOptimizedImageUrl(url: string | undefined, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
} = {}) {
  if (!url) return '/placeholder.svg';
  
  // Only apply transformations to Supabase storage URLs
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return url;
  }

  const {
    width = 600,
    quality = 80,
    format = 'webp',
    resize = 'cover'
  } = options;

  // Add transformation parameters to the URL
  // Note: This assumes the Supabase project has image transformation enabled (Pro plan)
  // If not, these parameters will be ignored by Supabase and the original image will be served.
  const params = new URLSearchParams();
  if (width) params.append('width', width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (quality) params.append('quality', quality.toString());
  if (format && format !== 'origin') params.append('format', format);
  params.append('resize', resize);

  // For Supabase, the parameters are passed as query strings to the public URL
  return `${url}?${params.toString()}`;
}
