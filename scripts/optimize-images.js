const sharp = require('sharp');
const fs = require('fs');

async function optimizeImages() {
  const images = [
    { input: 'public/header.jpg', output: 'public/images-optimized/header', width: 1200, quality: 70 },
    { input: 'public/logo.png', output: 'public/images-optimized/logo', width: 600, quality: 80 },
  ];

  for (const img of images) {
    try {
      if (!fs.existsSync(img.input)) {
        console.log(`Image not found: ${img.input}`);
        continue;
      }
      
      // Generate optimized JPEG/PNG
      const isPng = img.input.endsWith('.png');
      const pipeline = sharp(img.input).resize({ width: img.width, withoutEnlargement: true });
      
      if (isPng) {
        await pipeline.png({ quality: img.quality, compressionLevel: 9 }).toFile(`${img.output}.png`);
      } else {
        await pipeline.jpeg({ quality: img.quality, progressive: true }).toFile(`${img.output}.jpg`);
      }
      
      // Generate WebP version (usually much smaller)
      await sharp(img.input)
        .resize({ width: img.width, withoutEnlargement: true })
        .webp({ quality: img.quality })
        .toFile(`${img.output}.webp`);
      
      console.log(`Optimized: ${img.input} -> ${img.output}.{jpg/png,webp}`);
    } catch (err) {
      console.error(`Error optimizing ${img.input}:`, err);
    }
  }
}

optimizeImages();