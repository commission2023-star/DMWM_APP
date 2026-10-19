// Libelles partages pour l'affichage (valeurs en base -> texte lisible)
const LABELS_STATUT = { 'Nouveau': 'Nouveau', 'Confirme': 'Confirmé', 'Inactif': 'Inactif' };
const LABELS_CATEGORIE = { 'Nouveau Bachelier': 'Nouveau Bachelier', 'Nouveau Adherent': 'Nouveau Adhérent', 'Ancien': 'Ancien / Confirmé' };

function labelStatut(s) { return LABELS_STATUT[s] || s; }
function labelCategorie(c) { return LABELS_CATEGORIE[c] || c; }
