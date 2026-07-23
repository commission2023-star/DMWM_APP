function creerSidebar() {
  const user = window.currentUser || {};
  const role = user.role || '';

  const menuCA = ['Super Admin', 'Admin CA'].includes(role);
  const menuPF = role === 'PF';
  const menuAgent = ['Agent H', 'Agent F'].includes(role);
  const menuCommission = ['CIPS', 'CTC', 'CL'].includes(role);
  const menuSuperAdmin = role === 'Super Admin';

  const couleurRole = {
    'Super Admin': '#dc3545', 'Admin CA': '#0d6efd',
    'Agent H': '#198754', 'Agent F': '#e91e63',
    'PF': '#ffc107', 'CIPS': '#0dcaf0', 'CTC': '#6c757d', 'CL': '#212529'
  };

  const initiale = (user.nom || '?')[0].toUpperCase();
  const p = window.location.pathname;

  function lien(href, icone, texte) {
    const actif = p === href ? 'background:rgba(255,255,255,0.18);color:white;' : '';
    return `<a href="${href}" style="
      display:flex;align-items:center;gap:10px;
      color:rgba(255,255,255,0.8);text-decoration:none;
      border-radius:8px;padding:9px 14px;font-size:0.88rem;
      margin:1px 8px;transition:all 0.2s;${actif}"
      onmouseover="this.style.background='rgba(255,255,255,0.15)';this.style.color='white'"
      onmouseout="this.style.background='${p===href?'rgba(255,255,255,0.18)':'transparent'}';this.style.color='${p===href?'white':'rgba(255,255,255,0.8)'}'"
    ><i class="fas fa-${icone}" style="width:16px;text-align:center;flex-shrink:0;"></i>${texte}</a>`;
  }

  function label(texte) {
    return `<div style="color:rgba(255,255,255,0.4);font-size:0.68rem;font-weight:700;
      text-transform:uppercase;letter-spacing:1px;padding:12px 20px 4px;">${texte}</div>`;
  }

  let menuHtml = '';

  menuHtml += label('Principal');
  menuHtml += lien('/dashboard.html', 'tachometer-alt', 'Tableau de bord');

  if (menuCA || menuSuperAdmin) {
    menuHtml += label('Gestion membres');
    menuHtml += lien('/membres.html', 'users', 'Membres');
    menuHtml += lien('/nouveaux-adherents.html', 'user-plus', 'Nouveaux adherents');
    menuHtml += `<a href="/validation-inscriptions.html" style="
      display:flex;align-items:center;gap:10px;
      color:rgba(255,255,255,0.8);text-decoration:none;
      border-radius:8px;padding:9px 14px;font-size:0.88rem;
      margin:1px 8px;transition:all 0.2s;
      ${p==='/validation-inscriptions.html'?'background:rgba(255,255,255,0.18);color:white;':''}">
      <i class="fas fa-clipboard-check" style="width:16px;text-align:center;"></i>
      Inscriptions en attente
      <span id="badgeInscriptions" style="
        background:#dc3545;color:white;border-radius:50%;
        width:20px;height:20px;font-size:0.65rem;font-weight:700;
        display:none;align-items:center;justify-content:center;margin-left:auto;">0</span>
    </a>`;

    menuHtml += label('Programmes');
    menuHtml += lien('/programmes.html', 'calendar-alt', 'Programmes');
    menuHtml += lien('/pointage.html', 'check-square', 'Pointage');
    menuHtml += lien('/absences.html', 'user-times', 'Absences');

    menuHtml += label('Communication');
    menuHtml += lien('/boite-reception.html', 'inbox', 'Boite de reception');
    menuHtml += lien('/reunions.html', 'handshake', 'Reunions');

    menuHtml += label('Rapports');
    menuHtml += lien('/rapports.html', 'file-alt', 'Rapports');
  }

  if (menuPF) {
    menuHtml += label('Supervision');
    menuHtml += lien('/membres.html', 'chart-bar', 'Statistiques');
    menuHtml += lien('/boite-reception.html', 'inbox', 'Boite de reception');
    menuHtml += lien('/reunions.html', 'handshake', 'Reunions');
    menuHtml += lien('/partager-ca.html', 'paper-plane', 'Envoyer a la CA');
  }

  if (menuAgent || menuCommission) {
    menuHtml += label('Mes activites');
    menuHtml += lien('/programmes.html', 'calendar-alt', 'Programmes');
    menuHtml += lien('/reunions.html', 'handshake', 'Reunions');
    menuHtml += lien('/partager-ca.html', 'paper-plane', 'Envoyer a la CA');

    if (menuAgent) {
      menuHtml += label('Pointage');
      menuHtml += lien('/pointage.html', 'check-square', 'Faire le pointage');
    }
  }

  if (menuSuperAdmin) {
    menuHtml += label('Administration');
    menuHtml += lien('/comptes.html', 'user-cog', 'Gestion des comptes');
  }

  menuHtml += label('Mon compte');
  menuHtml += lien('/profil.html', 'user-circle', 'Mon profil');

  const sidebarHtml = `
    <style>
      body { margin: 0; }
      .page-wrapper {
        margin-left: 260px; min-height: 100vh;
        display: flex; flex-direction: column; background: #f0f4f8;
      }
      .topbar-page {
        background: white; padding: 14px 25px;
        border-bottom: 1px solid #e0e0e0;
        display: flex; align-items: center; justify-content: space-between;
        position: sticky; top: 0; z-index: 100;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      .topbar-page h5 { color: #1B5E8A; font-weight: 700; margin: 0; font-size: 1rem; }
      .btn-hamburger {
        display: none; background: none; border: 1px solid #ddd;
        border-radius: 8px; padding: 7px 11px; cursor: pointer;
        color: #1B5E8A; font-size: 1rem; flex-shrink: 0;
      }
      #sidebarOverlay {
        display: none; position: fixed; top: 0; left: 0;
        width: 100%; height: 100%; background: rgba(0,0,0,0.5);
        z-index: 998; backdrop-filter: blur(2px);
      }
      #dmwmSidebar {
        width: 260px; height: 100vh; position: fixed; left: 0; top: 0;
        background: linear-gradient(180deg, #1B5E8A 0%, #0d3d5e 100%);
        color: white; display: flex; flex-direction: column;
        z-index: 999; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }
      @media (max-width: 768px) {
        #dmwmSidebar { transform: translateX(-100%); z-index: 1000; }
        #dmwmSidebar.ouvert { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.3); }
        .page-wrapper { margin-left: 0 !important; }
        .btn-hamburger { display: flex !important; align-items: center; justify-content: center; }
        #sidebarOverlay.visible { display: block; }
      }
    </style>

    <div id="sidebarOverlay" onclick="fermerSidebar()"></div>

    <div id="dmwmSidebar">
      <div style="padding:20px 15px;border-bottom:1px solid rgba(255,255,255,0.1);
        text-align:center;flex-shrink:0;">
        <div style="font-size:2rem;margin-bottom:6px;">&#127968;</div>
        <div style="font-weight:700;font-size:0.9rem;line-height:1.3;">DMWM - Conseil UASZ</div>
        <div style="color:rgba(255,255,255,0.55);font-size:0.75rem;margin-top:3px;">
          Moustarchidine Junior
        </div>
      </div>

      <nav style="flex:1;overflow-y:auto;padding:8px 0;">
        ${menuHtml}
      </nav>

      <div style="padding:12px;border-top:1px solid rgba(255,255,255,0.1);flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;
          border-radius:10px;background:rgba(255,255,255,0.1);margin-bottom:8px;">
          <div style="
            width:38px;height:38px;border-radius:50%;flex-shrink:0;
            background:${couleurRole[role] || '#555'};
            display:flex;align-items:center;justify-content:center;
            font-weight:700;font-size:1rem;color:white;">
            ${initiale}
          </div>
          <div style="overflow:hidden;flex:1;">
            <div style="font-size:0.85rem;font-weight:600;
              white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${user.nom || 'Utilisateur'}
            </div>
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.55);">${role}</div>
          </div>
        </div>
        <button onclick="deconnexion()" style="
          width:100%;
          background:linear-gradient(135deg,#dc3545,#c82333);
          border:none;border-radius:8px;
          color:white;padding:10px;
          font-size:0.88rem;font-weight:600;
          cursor:pointer;transition:opacity 0.2s;
          display:flex;align-items:center;justify-content:center;gap:8px;"
          onmouseover="this.style.opacity='0.85'"
          onmouseout="this.style.opacity='1'">
          <i class="fas fa-sign-out-alt"></i>
          Se deconnecter
        </button>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = sidebarHtml;
  document.body.insertBefore(container, document.body.firstChild);

  if (menuCA || menuSuperAdmin) {
    chargerBadgeInscriptions();
  }
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
      badge.style.display = 'flex';
    }
  } catch(e) {}
}

function toggleSidebar() {
  const sidebar = document.getElementById('dmwmSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const estOuvert = sidebar.classList.contains('ouvert');

  if (estOuvert) {
    sidebar.classList.remove('ouvert');
    overlay.classList.remove('visible');
  } else {
    sidebar.classList.add('ouvert');
    overlay.classList.add('visible');
  }
}

function fermerSidebar() {
  document.getElementById('dmwmSidebar').classList.remove('ouvert');
  document.getElementById('sidebarOverlay').classList.remove('visible');
}

document.addEventListener('click', function(e) {
  const sidebar = document.getElementById('dmwmSidebar');
  const hamburger = document.querySelector('.btn-hamburger');
  if (!sidebar || !hamburger) return;

  if (window.innerWidth <= 768 &&
      sidebar.classList.contains('ouvert') &&
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target)) {
    fermerSidebar();
  }
});

function deconnexion() {
  if (confirm('Voulez-vous vous deconnecter ?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    window.location.href = '/index.html';
  }
}

creerSidebar();
