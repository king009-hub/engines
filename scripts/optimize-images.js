const sharp = require('sharp');
const fs = require('fs');

async function optimizeImages() {
  const images = [
    { input: 'public/header.jpg', output: 'public/images-optimized/header.jpg', width: 1200, quality: 70 },
    { input: 'public/logo.png', output: 'public/images-optimized/logo.png', width: 600, quality: 80 },
  ];

  for (const img of images) {
    try {
      if (!fs.existsSync(img.input)) {
        console.log(`Image not found: ${img.input}`);
        continue;
      }
      
      await sharp(img.input)
        .resize({ width: img.width, withoutEnlargement: true })
        .jpeg({ quality: img.quality })
        .toFile(img.output);
      
      console.log(`Optimized: ${img.input} -> ${img.output}`);
    } catch (err) {
      console.error(`Error optimizing ${img.input}:`, err);
    }
  }
}

optimizeImages();