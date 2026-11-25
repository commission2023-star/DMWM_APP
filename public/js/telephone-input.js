// Champs telephone : prefixe +221 fixe, numero affiche en groupes (77 123 45 67).
// La base ne garde que les 9 chiffres : le serveur normalise toujours.
(function () {
  const IDS = ['f_telephone', 'f_tuteur_telephone', 'f_pf_telephone', 'telephone', 'tuteur_telephone', 'pf_telephone', 'visTelephone'];

  // Garde uniquement les chiffres, retire un 221 de tete, limite a 9 chiffres
  function chiffres(texte) {
    let d = String(texte || '').replace(/\D/g, '');
    if (d.length > 9 && d.startsWith('221')) d = d.slice(3);
    return d.slice(0, 9);
  }

  // 771234567 -> "77 123 45 67"
  function formater(texte) {
    const d = chiffres(texte);
    return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
  }

  // Position du curseur apres le n-ieme chiffre
  function positionApres(valeur, n) {
    if (n === 0) return 0;
    let vus = 0;
    for (let i = 0; i < valeur.length; i++) {
      if (/\d/.test(valeur[i])) vus++;
      if (vus === n) return i + 1;
    }
    return valeur.length;
  }

  function preparer(input) {
    const groupe = document.createElement('div');
    groupe.className = 'input-group';
    const prefixe = document.createElement('span');
    prefixe.className = 'input-group-text prefixe-tel';
    prefixe.textContent = '+221';
    input.parentNode.insertBefore(groupe, input);
    groupe.appendChild(prefixe);
    groupe.appendChild(input);
    input.setAttribute('inputmode', 'tel');
    input.setAttribute('autocomplete', 'tel-national');
    input.setAttribute('placeholder', '77 123 45 67');
    input.value = formater(input.value);
    input.addEventListener('input', () => {
      const curseur = input.selectionStart;
      const nbChiffres = chiffres(input.value.slice(0, curseur)).length;
      input.value = formater(input.value);
      const pos = positionApres(input.value, nbChiffres);
      input.setSelectionRange(pos, pos);
    });
  }

  function demarrer() {
    IDS.forEach((id) => {
      const input = document.getElementById(id);
      if (input) preparer(input);
    });
  }

  // Reformate les numeros remplis par programme (ex : chargement d'un membre)
  window.rafraichirTelephones = function () {
    IDS.forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = formater(input.value);
    });
  };
  window.formaterTelephone = formater;

  demarrer();
})();