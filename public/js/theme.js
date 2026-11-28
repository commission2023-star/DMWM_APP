// Theme clair / sombre : le choix est memorise dans localStorage.
// L'attribut data-theme est deja pose par le script inline du <head>.
(function () {
  const CLE = 'dmwm-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function themeActuel() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function appliquer(theme) {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0d0918' : '#6d28d9');
    const bouton = document.getElementById('themeToggle');
    if (bouton) {
      bouton.innerHTML = `<i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}"></i>`;
      bouton.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Passer au theme clair' : 'Passer au theme sombre'
      );
      bouton.title = theme === 'dark' ? 'Theme clair' : 'Theme sombre';
      if (window.rafraichirIcones) window.rafraichirIcones();
    }
  }

  function basculer() {
    const suivant = themeActuel() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(CLE, suivant);
    appliquer(suivant);
  }

  function creerBouton() {
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.id = 'themeToggle';
    bouton.className = 'theme-toggle';
    bouton.addEventListener('click', basculer);

    const topbar = document.querySelector('.topbar-page');
    if (topbar) {
      let actions = topbar.querySelector('.topbar-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'topbar-actions';
        // Tout ce qui suit le titre passe dans la zone d'actions.
        while (topbar.children.length > 1) actions.appendChild(topbar.children[1]);
        topbar.appendChild(actions);
      }
      const badge = document.getElementById('badgeRole');
      if (badge && badge.parentElement === actions) actions.insertBefore(bouton, badge);
      else actions.appendChild(bouton);
    } else {
      bouton.classList.add('flottant');
      document.body.appendChild(bouton);
    }
    return bouton;
  }

  function demarrer() {
    if (!document.getElementById('themeToggle')) creerBouton();
    appliquer(themeActuel());

    media.addEventListener('change', function (e) {
      if (!localStorage.getItem(CLE)) appliquer(e.matches ? 'dark' : 'light');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
