function creerSidebar() {
  const user = window.currentUser || {};
  const role = user.role || '';

  const menuCA = ['Super Admin', 'Admin CA'].includes(role);
  const menuPF = role === 'PF';
  const menuAgent = ['Agent H', 'Agent F'].includes(role);
  const menuCommission = ['CIPS', 'CTC', 'CL'].includes(role);
  const menuSuperAdmin = role === 'Super Admin';

  const initiale = (user.nom || '?').trim()[0].toUpperCase();
  const chemin = window.location.pathname;

  function lien(href, icone, texte, extra = '') {
    const actif = chemin === href;
    return `<a href="${href}" class="sidebar-link${actif ? ' actif' : ''}"
      ${actif ? 'aria-current="page"' : ''}>
      <i data-lucide="${icone}"></i><span>${texte}</span>${extra}</a>`;
  }

  function label(texte) {
    return `<div class="nav-label">${texte}</div>`;
  }

  const badgeInscriptions = `<span id="badgeInscriptions" class="sidebar-badge">0</span>`;

  let menuHtml = '';
  menuHtml += label('Principal');
  menuHtml += lien('/dashboard.html', 'layout-dashboard', 'Tableau de bord');

  if (menuCA) {
    menuHtml += label('Gestion des membres');
    menuHtml += lien('/membres.html', 'users', 'Membres');
    menuHtml += lien('/nouveaux-adherents.html', 'user-plus', 'Nouveaux adhérents');
    menuHtml += lien('/validation-inscriptions.html', 'clipboard-check', 'Inscriptions en attente', badgeInscriptions);

    menuHtml += label('Programmes');
    menuHtml += lien('/programmes.html', 'calendar-days', 'Programmes');
    menuHtml += lien('/pointage.html', 'square-check-big', 'Pointage');
    menuHtml += lien('/absences.html', 'user-x', 'Absences');
    menuHtml += lien('/visiteurs.html', 'users-round', 'Visiteurs');

    menuHtml += label('Communication');
    menuHtml += lien('/boite-reception.html', 'inbox', 'Boîte de réception');
    menuHtml += lien('/reunions.html', 'handshake', 'Réunions');

    menuHtml += label('Rapports');
    menuHtml += lien('/rapports.html', 'chart-column', 'Rapports');
  }

  if (menuPF) {
    menuHtml += label('Supervision');
    menuHtml += lien('/membres.html', 'chart-column', 'Statistiques');
    menuHtml += lien('/visiteurs.html', 'users-round', 'Visiteurs');
    menuHtml += lien('/boite-reception.html', 'inbox', 'Boîte de réception');
    menuHtml += lien('/reunions.html', 'handshake', 'Réunions');
    menuHtml += lien('/rapports.html', 'chart-column', 'Rapports');
    menuHtml += lien('/partager-ca.html', 'send', 'Envoyer à la CA');
  }

  if (menuAgent) {
    menuHtml += label('Mes activités');
    menuHtml += lien('/programmes.html', 'calendar-days', 'Programmes');
    menuHtml += label('Pointage');
    menuHtml += lien('/pointage.html', 'square-check-big', 'Faire le pointage');
  }

  if (menuCommission) {
    menuHtml += label('Mes activités');
    menuHtml += lien('/programmes.html', 'calendar-days', 'Programmes');
    menuHtml += lien('/reunions.html', 'handshake', 'Réunions');
    menuHtml += lien('/partager-ca.html', 'send', 'Envoyer à la CA');
  }

  if (menuSuperAdmin) {
    menuHtml += label('Administration');
    menuHtml += lien('/comptes.html', 'user-cog', 'Gestion des comptes');
  }

  menuHtml += label('Mon compte');
  menuHtml += lien('/profil.html', 'circle-user-round', 'Mon profil');

  const sidebarHtml = `
    <div id="sidebarOverlay" onclick="fermerSidebar()"></div>
    <aside id="dmwmSidebar" aria-label="Navigation principale">
      <div class="sidebar-brand">
        <div class="sidebar-mark" aria-hidden="true">DM</div>
        <div>
          <div class="sidebar-title">Conseil UASZ</div>
          <div class="sidebar-sub">Moustarchidine Junior</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${menuHtml}
      </nav>

      <div class="sidebar-foot">
        <div class="sidebar-user">
          <div class="sidebar-avatar" aria-hidden="true">${initiale}</div>
          <div class="sidebar-user-txt">
            <div class="sidebar-user-name">${user.nom || 'Utilisateur'}</div>
            <div class="sidebar-user-role">${role}</div>
          </div>
        </div>
        <button type="button" class="sidebar-logout" onclick="deconnexion()">
          <i data-lucide="log-out"></i>Se déconnecter
        </button>
      </div>
    </aside>
  `;

  const conteneur = document.createElement('div');
  conteneur.innerHTML = sidebarHtml;
  document.body.insertBefore(conteneur, document.body.firstChild);

  if (menuCA) chargerBadgeInscriptions();
}

async function chargerBadgeInscriptions() {
  try {
    const res = await fetch('/api/inscriptions/stats', {
      headers: { Authorization: `Bearer ${window.authToken}` }
    });
    const d = await res.json();
    const badge = document.getElementById('badgeInscriptions');
    if (badge && d.enAttente > 0) {
      badge.textContent = d.enAttente;
      badge.classList.add('visible');
    }
  } catch (e) {}
}

function toggleSidebar() {
  const sidebar = document.getElementById('dmwmSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return;

  const ouvert = sidebar.classList.toggle('ouvert');
  overlay.classList.toggle('visible', ouvert);
  document.body.style.overflow = ouvert && window.innerWidth <= 992 ? 'hidden' : '';
}

function fermerSidebar() {
  const sidebar = document.getElementById('dmwmSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('ouvert');
  if (overlay) overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

document.addEventListener('click', function (e) {
  const sidebar = document.getElementById('dmwmSidebar');
  const hamburger = document.querySelector('.btn-hamburger');
  if (!sidebar || !hamburger) return;

  if (
    window.innerWidth <= 992 &&
    sidebar.classList.contains('ouvert') &&
    !sidebar.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    fermerSidebar();
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') fermerSidebar();
});

function deconnexion() {
  if (confirm('Voulez-vous vous déconnecter ?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('cache_programmes');
    localStorage.removeItem('cache_membres');
    window.location.href = '/index.html';
  }
}

creerSidebar();
