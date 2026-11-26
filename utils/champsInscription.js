// Champs qu'un dossier d'inscription peut contenir (ceux du formulaire public)
const CHAMPS_AUTORISES = [
  'prenom', 'nom', 'sexe', 'date_naissance', 'lieu_naissance',
  'telephone', 'email', 'adresse', 'tuteur_nom', 'tuteur_telephone',
  'filiere', 'niveau', 'region_origine', 'departement', 'arrondissement', 'commune',
  'comite_origine', 'conseil_origine', 'section_base', 'poste_section_base',
  'pf_nom', 'pf_telephone'
];

// Les fichiers ne sont admis que s'ils sont deja sur Cloudinary
const CHAMPS_FICHIERS = ['photo_profil', 'document_identite'];
const URL_CLOUDINARY = /^https:\/\/res\.cloudinary\.com\//;

// Ne garde que les champs autorises. avecFichiers = true : garde aussi les
// deux fichiers, mais seulement si leur valeur est une URL Cloudinary.
const filtrerDonnees = (donnees, avecFichiers = false) => {
  const propres = {};
  if (!donnees) return propres;
  for (const champ of CHAMPS_AUTORISES) {
    if (donnees[champ] !== undefined) propres[champ] = donnees[champ];
  }
  if (avecFichiers) {
    for (const champ of CHAMPS_FICHIERS) {
      if (URL_CLOUDINARY.test(String(donnees[champ] || ''))) propres[champ] = donnees[champ];
    }
  }
  return propres;
};

module.exports = { filtrerDonnees, CHAMPS_AUTORISES };