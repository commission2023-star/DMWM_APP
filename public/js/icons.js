// Conversion des anciennes icones Font Awesome vers Lucide.
// Les pages existantes gardent leurs classes fa-* : ce fichier les traduit
// une seule fois, puis surveille le contenu ajoute dynamiquement.
(function () {
  const CORRESPONDANCE = {
    'fa-archive': 'archive',
    'fa-arrow-left': 'arrow-left',
    'fa-bars': 'menu',
    'fa-book': 'book-open',
    'fa-bullseye': 'target',
    'fa-calendar': 'calendar',
    'fa-calendar-alt': 'calendar-days',
    'fa-calendar-check': 'calendar-check',
    'fa-calendar-plus': 'calendar-plus',
    'fa-calendar-times': 'calendar-x',
    'fa-chart-line': 'chart-line',
    'fa-chart-pie': 'chart-pie',
    'fa-check': 'check',
    'fa-check-circle': 'circle-check',
    'fa-check-double': 'check-check',
    'fa-check-square': 'square-check-big',
    'fa-clipboard-check': 'clipboard-check',
    'fa-clock': 'clock',
    'fa-download': 'download',
    'fa-edit': 'pencil',
    'fa-envelope': 'mail',
    'fa-envelope-open': 'mail-open',
    'fa-exclamation-circle': 'circle-alert',
    'fa-exclamation-triangle': 'triangle-alert',
    'fa-external-link-alt': 'external-link',
    'fa-eye': 'eye',
    'fa-eye-slash': 'eye-off',
    'fa-file': 'file',
    'fa-file-alt': 'file-text',
    'fa-file-excel': 'file-spreadsheet',
    'fa-file-image': 'file-image',
    'fa-file-pdf': 'file-text',
    'fa-file-signature': 'file-signature',
    'fa-filter': 'filter',
    'fa-graduation-cap': 'graduation-cap',
    'fa-hand-pointer': 'pointer',
    'fa-handshake': 'handshake',
    'fa-history': 'history',
    'fa-id-card': 'id-card',
    'fa-inbox': 'inbox',
    'fa-info-circle': 'info',
    'fa-list': 'list',
    'fa-list-ul': 'list',
    'fa-lock': 'lock',
    'fa-map-marker-alt': 'map-pin',
    'fa-mars': 'mars',
    'fa-mosque': 'landmark',
    'fa-paperclip': 'paperclip',
    'fa-paper-plane': 'send',
    'fa-phone': 'phone',
    'fa-play': 'play',
    'fa-plus': 'plus',
    'fa-redo': 'rotate-cw',
    'fa-save': 'save',
    'fa-search': 'search',
    'fa-sign-in-alt': 'log-in',
    'fa-sign-out-alt': 'log-out',
    'fa-spinner': 'loader-circle',
    'fa-star': 'star',
    'fa-sticky-note': 'sticky-note',
    'fa-sync': 'refresh-cw',
    'fa-tachometer-alt': 'layout-dashboard',
    'fa-th-large': 'layout-grid',
    'fa-times': 'x',
    'fa-times-circle': 'circle-x',
    'fa-trash': 'trash-2',
    'fa-trophy': 'trophy',
    'fa-undo': 'undo-2',
    'fa-user': 'user',
    'fa-user-check': 'user-check',
    'fa-user-circle': 'circle-user-round',
    'fa-user-cog': 'user-cog',
    'fa-user-friends': 'users-round',
    'fa-user-plus': 'user-plus',
    'fa-users': 'users',
    'fa-user-shield': 'shield-user',
    'fa-user-tag': 'tag',
    'fa-user-times': 'user-x',
    'fa-venus': 'venus',
    'fa-venus-mars': 'venus-and-mars',
    'fa-whatsapp': 'message-circle',
    'fa-wifi': 'wifi'
  };

  const TAILLES = { 'fa-2x': 'icon-lg', 'fa-3x': 'icon-xl', 'fa-fw': 'icon-fw' };
  const BASES = ['fas', 'far', 'fab', 'fa-solid', 'fa-regular', 'fa-brands'];

  function convertir(el) {
    const classes = Array.from(el.classList);
    const icone = classes.find((c) => CORRESPONDANCE[c]);
    if (!icone) return false;

    el.setAttribute('data-lucide', CORRESPONDANCE[icone]);
    el.setAttribute('aria-hidden', 'true');

    BASES.forEach((c) => el.classList.remove(c));
    Object.keys(CORRESPONDANCE).forEach((c) => el.classList.remove(c));
    el.classList.remove('fa-spin');
    if (classes.includes('fa-spin')) el.classList.add('icon-spin');

    Object.keys(TAILLES).forEach((c) => {
      if (classes.includes(c)) {
        el.classList.remove(c);
        el.classList.add(TAILLES[c]);
      }
    });

    return true;
  }

  function rendre() {
    if (!window.lucide) return;

    // Les icones ecrites en dur ont deja ete converties ; on ne traite ici
    // que celles ajoutees apres le chargement (tableaux, modales, alertes).
    document.querySelectorAll('i[class*="fa-"], span[class*="fa-"]').forEach(convertir);

    window.lucide.createIcons({
      attrs: { 'stroke-width': 1.75, 'aria-hidden': 'true' }
    });
  }

  window.rafraichirIcones = rendre;

  function demarrer() {
    rendre();

    const observateur = new MutationObserver(() => {
      if (document.querySelector('i[class*="fa-"], span[class*="fa-"]')) {
        window.requestAnimationFrame(rendre);
      }
    });

    observateur.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
