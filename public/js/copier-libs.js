const fs = require('fs');
const path = require('path');

// Copie locale des librairies : l'application doit fonctionner hors ligne
// et Render ne doit pas dependre d'un CDN.
const copies = [
  {
    src: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
    dest: 'public/css/bootstrap.min.css'
  },
  {
    src: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    dest: 'public/js-libs/bootstrap.bundle.min.js'
  },
  {
    src: 'node_modules/chart.js/dist/chart.umd.min.js',
    dest: 'public/js-libs/chart.umd.min.js'
  },
  {
    src: 'node_modules/lucide/dist/umd/lucide.min.js',
    dest: 'public/js-libs/lucide.min.js'
  }
];

// Polices : uniquement les graisses utilisees par la feuille de style.
const polices = [
  'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2',
  'node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2',
  'node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2',
  'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2',
  'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2',
  'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2',
  'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2',
  'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2',
  'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2'
];

const destFonts = 'public/fonts';
if (!fs.existsSync(destFonts)) fs.mkdirSync(destFonts, { recursive: true });

polices.forEach((src) => {
  const dest = path.join(destFonts, path.basename(src));
  fs.copyFileSync(src, dest);
  console.log(`Copie : ${dest}`);
});

copies.forEach(({ src, dest }) => {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copie : ${dest}`);
});

console.log('Toutes les librairies et polices sont copiees localement.');
