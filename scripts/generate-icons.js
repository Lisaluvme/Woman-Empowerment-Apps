import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple SVG icons for PWA
const sizes = [48, 72, 96, 144, 192, 512];
const publicDir = path.join(__dirname, '..', 'public');

// Create shield icon SVG for each size
sizes.forEach(size => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d9488;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <path d="M${size * 0.35},${size * 0.2} L${size * 0.65},${size * 0.2} L${size * 0.65},${size * 0.35} Q${size * 0.65},${size * 0.7} ${size * 0.5},${size * 0.8} Q${size * 0.35},${size * 0.7} ${size * 0.35},${size * 0.35} Z"
        fill="white" stroke="white" stroke-width="2"/>
  <circle cx="${size * 0.5}" cy="${size * 0.45}" r="${size * 0.08}" fill="#0d9488"/>
  <path d="M${size * 0.42},${size * 0.6} L${size * 0.46},${size * 0.65} L${size * 0.55},${size * 0.52}"
        stroke="#0d9488" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    fs.writeFileSync(path.join(publicDir, `icon-${size}.svg`), svg);
    console.log(`Created icon-${size}.svg`);
});

// Also create a favicon
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#14b8a6" rx="6"/>
  <path d="M11,6 L21,6 L21,11 Q21,22 16,25 Q11,22 11,11 Z" fill="white"/>
  <circle cx="16" cy="14" r="3" fill="#0d9488"/>
  <path d="M13,18 L15,21 L20,16" stroke="#0d9488" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

console.log('\n✅ Icons created successfully!');