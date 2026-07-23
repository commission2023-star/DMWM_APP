const fs = require('fs');
const path = require('path');

const pages = [
  {
    fichier: 'membres.html',
    titre: '<i class="fas fa-users me-2"></i>Gestion des membres',
    bouton: '<a href="/membre-form.html" class="btn btn-primary btn-sm"><i class="fas fa-plus me-1"></i>Nouveau membre</a>'
  },
  {
    fichier: 'nouveaux-adherents.html',
    titre: '<i class="fas fa-user-plus me-2"></i>Nouveaux adherents',
    bouton: ''
  },
  {
    fichier: 'membre-form.html',
    titre: '<i class="fas fa-user-edit me-2"></i>Formulaire membre',
    bouton: ''
  },
  {
    fichier: 'membre-detail.html',
    titre: '<i class="fas fa-user me-2"></i>Detail du membre',
    bouton: ''
  },
  {
    fichier: 'comptes.html',
    titre: '<i class="fas fa-user-cog me-2"></i>Gestion des comptes',
    bouton: '<button class="btn btn-primary btn-sm" onclick="ouvrirModalCreer()"><i class="fas fa-plus me-1"></i>Nouveau compte</button>'
  },
  {
    fichier: 'profil.html',
    titre: '<i class="fas fa-user-circle me-2"></i>Mon profil',
    bouton: ''
  },
  {
    fichier: 'validation-inscriptions.html',
    titre: '<i class="fas fa-clipboard-check me-2"></i>Validation des inscriptions',
    bouton: '<a href="/inscription.html" target="_blank" class="btn btn-outline-primary btn-sm"><i class="fas fa-external-link-alt me-1"></i>Formulaire public</a>'
  },
  {
    fichier: 'programmes.html',
    titre: '<i class="fas fa-calendar-alt me-2"></i>Programmes',
    bouton: '<button class="btn btn-primary btn-sm" onclick="ouvrirModalCreer()" id="btnNouveauProg"><i class="fas fa-plus me-1"></i>Nouveau programme</button>'
  },
  {
    fichier: 'pointage.html',
    titre: '<i class="fas fa-check-square me-2"></i>Pointage',
    bouton: ''
  },
  {
    fichier: 'absences.html',
    titre: '<i class="fas fa-user-times me-2"></i>Suivi des absences',
    bouton: ''
  },
  {
    fichier: 'boite-reception.html',
    titre: '<i class="fas fa-inbox me-2"></i>Boite de reception',
    bouton: ''
  },
  {
    fichier: 'partager-ca.html',
    titre: '<i class="fas fa-paper-plane me-2"></i>Envoyer a la CA',
    bouton: ''
  },
  {
    fichier: 'reunions.html',
    titre: '<i class="fas fa-handshake me-2"></i>Reunions du Conseil',
    bouton: '<button class="btn btn-primary btn-sm" id="btnNouvelleReunion" onclick="ouvrirModalReunion()"><i class="fas fa-plus me-1"></i>Nouvelle reunion</button>'
  }
];

let succes = 0;
let echecs = 0;

pages.forEach(page => {
  const filePath = path.join(__dirname, 'public', page.fichier);

  if (!fs.existsSync(filePath)) {
    console.log(`Fichier introuvable : ${page.fichier}`);
    echecs++;
    return;
  }

  let contenu = fs.readFileSync(filePath, 'utf8');

  if (contenu.includes('sidebar.js')) {
    console.log(`Deja a jour : ${page.fichier}`);
    succes++;
    return;
  }

  contenu = contenu.replace(
    '<body>',
    `<body>\n<script src="/js/auth-guard.js"></script>\n<script src="/js/sidebar.js"></script>`
  );

  const topbarRegex = /<div class="topbar"[\s\S]*?<\/div>\s*\n(\s*<\/div>)?/;

  const nouvelleTopbar = `<div class="page-wrapper">
  <div class="topbar-page">
    <div class="d-flex align-items-center gap-3">
      <button class="btn-hamburger" onclick="toggleSidebar()">
        <i class="fas fa-bars"></i>
      </button>
      <h5>${page.titre}</h5>
    </div>
    <div>${page.bouton}</div>
  </div>
  <div style="padding:25px;flex:1;">`;

  if (topbarRegex.test(contenu)) {
    contenu = contenu.replace(topbarRegex, nouvelleTopbar);
    contenu = contenu.replace('</body>', '  </div>\n</div>\n</body>');
    console.log(`Mis a jour : ${page.fichier}`);
    succes++;
  } else {
    console.log(`Topbar non detectee dans : ${page.fichier} - scripts ajoutes uniquement`);
    succes++;
  }

  fs.writeFileSync(filePath, contenu, 'utf8');
});

console.log(`\nResultat : ${succes} page(s) traitee(s), ${echecs} erreur(s)`);
console.log('Termine ! Redemarrez le serveur et testez.');
