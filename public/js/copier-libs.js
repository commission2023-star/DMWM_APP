const fs = require('fs');
const path = require('path');

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
    src: 'node_modules/@fortawesome/fontawesome-free/css/all.min.css',
    dest: 'public/css/fontawesome.min.css'
  }
];

const fontsDir = 'node_modules/@fortawesome/fontawesome-free/webfonts';
const destFonts = 'public/fonts';

if (!fs.existsSync(destFonts)) fs.mkdirSync(destFonts, { recursive: true });

fs.readdirSync(fontsDir).forEach(file => {
  fs.copyFileSync(
    path.join(fontsDir, file),
    path.join(destFonts, file)
  );
});

copies.forEach(({ src, dest }) => {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copie : ${dest}`);
});

let faCSS = fs.readFileSync('public/css/fontawesome.min.css', 'utf8');
faCSS = faCSS.replace(/\.\.\/webfonts\//g, '../fonts/');
fs.writeFileSync('public/css/fontawesome.min.css', faCSS);

console.log('Chemins fonts corriges');
console.log('Toutes les librairies copiees localement !');
