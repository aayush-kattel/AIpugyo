import sharp from 'sharp';

await sharp('public/logo.png').resize(192, 192).toFile('public/pwa-192.png');
await sharp('public/logo.png').resize(512, 512).toFile('public/pwa-512.png');
console.log('✅ Icons generated: pwa-192.png and pwa-512.png');