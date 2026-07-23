const LABELS_STATUT = {
  Nouveau: 'Nouveau',
  Confirme: 'Confirmé',
  Inactif: 'Inactif'
};

const LABELS_CATEGORIE = {
  'Nouveau Bachelier': 'Nouveau Bachelier',
  'Nouveau Adherent': 'Nouveau Adhérent',
  Ancien: 'Ancien / Confirmé'
};

const LABELS_COMMISSION = {
  PF: 'PF',
  CA: 'CA',
  CIPS: 'CIPS',
  CTC: 'CTC',
  CL: 'CL',
  'Membre simple': 'Membre simple'
};

function labelStatut(s) {
  return LABELS_STATUT[s] || s;
}

function labelCategorie(c) {
  return LABELS_CATEGORIE[c] || c;
}

function labelCommission(c) {
  return LABELS_COMMISSION[c] || c;
}
