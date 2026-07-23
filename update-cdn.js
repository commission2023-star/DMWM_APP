const fs = require('fs');
const path = require('path');

const dossierPublic = path.join(__dirname, 'public');

const pages = fs.readdirSync(dossierPublic).filter(f => f.endsWith('.html'));

let totalModifies = 0;

pages.forEach(fichier => {
  const filePath = path.join(dossierPublic, fichier);
  let contenu = fs.readFileSync(filePath, 'utf8');
  const original = contenu;

  contenu = contenu.replace(
    /https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@[^"]+\/dist\/css\/bootstrap\.min\.css/g,
    '/css/bootstrap.min.css'
  );

  contenu = contenu.replace(
    /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"]+\/css\/all\.min\.css/g,
    '/css/fontawesome.min.css'
  );

  contenu = contenu.replace(
    /https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@[^"]+\/dist\/js\/bootstrap\.bundle\.min\.js/g,
    '/js-libs/bootstrap.bundle.min.js'
  );

  if (contenu !== original) {
    fs.writeFileSync(filePath, contenu, 'utf8');
    console.log(`Mis a jour : ${fichier}`);
    totalModifies++;
  } else {
    console.log(`Deja local ou pas de CDN : ${fichier}`);
  }
});

console.log(`\n${totalModifies} page(s) mise(s) a jour`);
console.log('Toutes les pages utilisent maintenant les librairies locales !');
