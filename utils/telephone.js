// Normalise un numero senegalais : retourne les 9 chiffres, ou null si invalide
const normaliserTelephone = (telephone) => {
  if (!telephone) return null;
  const nettoye = String(telephone).replace(/[\s\-]/g, '');
  const m = nettoye.match(/^(?:\+?221)?([0-9]{9})$/);
  return m ? m[1] : null;
};

// Champs telephone d'un membre ou d'un dossier d'inscription, avec leur libelle pour les messages
const CHAMPS_TELEPHONE = {
  telephone: 'Numero de telephone',
  tuteur_telephone: 'Telephone du tuteur',
  pf_telephone: 'Telephone du PF'
};

// Normalise en place les champs telephone remplis de l'objet.
// Retourne le libelle du premier champ invalide, ou null si tout est valide.
const normaliserChampsTelephone = (donnees) => {
  for (const [champ, libelle] of Object.entries(CHAMPS_TELEPHONE)) {
    if (!donnees[champ]) continue;
    const numero = normaliserTelephone(donnees[champ]);
    if (!numero) return libelle;
    donnees[champ] = numero;
  }
  return null;
};

// Les 3 formes sous lesquelles un meme numero peut deja etre stocke
const formesTelephone = (numero) => [numero, `221${numero}`, `+221${numero}`];

module.exports = { normaliserTelephone, normaliserChampsTelephone, formesTelephone };