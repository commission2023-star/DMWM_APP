const { Visiteur, Visite, Programme, Parametre } = require('../models');

const CLE_SEUIL = 'seuil_visiteurs';
const SEUIL_PAR_DEFAUT = 3;
const STATUTS_MANUELS = ['A contacter', 'Contacte'];

// Pour le comptage : le type du programme, sauf pour "Autre" ou c'est son nom
const identifierProgramme = (p) => {
  if (!p) return { cle: 'inconnu', libelle: 'Programme inconnu' };
  if (p.type !== 'Autre') return { cle: p.type, libelle: p.type };
  const nom = String(p.nom || '').trim();
  return { cle: `Autre:${nom.toLowerCase()}`, libelle: nom || 'Autre' };
};

const lireSeuil = async () => {
  const param = await Parametre.findByPk(CLE_SEUIL);
  const n = param ? parseInt(param.valeur, 10) : NaN;
  return Number.isInteger(n) && n >= 1 ? n : SEUIL_PAR_DEFAUT;
};

const listerVisiteurs = async (req, res) => {
  try {
    const { programme, statut, min, potentiels } = req.query;
    const seuil = await lireSeuil();

    const visiteurs = await Visiteur.findAll({
      include: [{ model: Visite, include: [{ model: Programme }] }],
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    const programmesVus = new Map();

    const lignes = visiteurs.map(v => {
      const parProgramme = new Map();
      for (const visite of v.Visites || []) {
        const { cle, libelle } = identifierProgramme(visite.Programme);
        programmesVus.set(cle, libelle);
        const ligne = parProgramme.get(cle) || { cle, programme: libelle, nombre: 0, derniere_date: null };
        ligne.nombre++;
        const date = visite.Programme ? visite.Programme.date : null;
        if (date && (!ligne.derniere_date || date > ligne.derniere_date)) ligne.derniere_date = date;
        parProgramme.set(cle, ligne);
      }
      const participations = [...parProgramme.values()].sort((a, b) => b.nombre - a.nombre);
      const meilleur = participations.length ? participations[0].nombre : 0;
      return {
        id: v.id,
        prenom: v.prenom,
        nom: v.nom,
        telephone: v.telephone,
        statut_suivi: v.statut_suivi,
        membre_id: v.membre_id,
        created_at: v.created_at,
        total_visites: (v.Visites || []).length,
        participations,
        meilleur,
        potentiel: meilleur >= seuil
      };
    });

    const minimum = parseInt(min, 10);
    const resultat = lignes.filter(l => {
      if (statut && l.statut_suivi !== statut) return false;
      const trouve = programme ? l.participations.find(p => p.cle === programme) : null;
      const nombreRef = programme ? (trouve ? trouve.nombre : 0) : l.meilleur;
      if (programme && nombreRef === 0) return false;
      if (Number.isInteger(minimum) && nombreRef < minimum) return false;
      const atteint = programme ? nombreRef >= seuil : l.potentiel;
      if (potentiels === 'true' && !atteint) return false;
      return true;
    });

    res.json({
      seuil,
      programmes: [...programmesVus].map(([cle, libelle]) => ({ cle, libelle })).sort((a, b) => a.libelle.localeCompare(b.libelle)),
      visiteurs: resultat
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const historiqueVisiteur = async (req, res) => {
  try {
    const visiteur = await Visiteur.findByPk(req.params.id);
    if (!visiteur) return res.status(404).json({ message: 'Visiteur introuvable.' });

    const visites = await Visite.findAll({
      where: { visiteur_id: visiteur.id },
      include: [{ model: Programme, attributes: ['id', 'type', 'nom', 'date', 'lieu'] }],
      order: [[Programme, 'date', 'DESC']]
    });

    res.json({
      visiteur: {
        id: visiteur.id, prenom: visiteur.prenom, nom: visiteur.nom, telephone: visiteur.telephone,
        statut_suivi: visiteur.statut_suivi, membre_id: visiteur.membre_id
      },
      historique: visites.map(v => ({
        visite_id: v.id,
        programme: identifierProgramme(v.Programme).libelle,
        date: v.Programme ? v.Programme.date : null,
        lieu: v.Programme ? v.Programme.lieu : null
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const changerStatutVisiteur = async (req, res) => {
  try {
    const { statut } = req.body;
    if (!STATUTS_MANUELS.includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide. Valeurs possibles : A contacter, Contacte.' });
    }
    const visiteur = await Visiteur.findByPk(req.params.id);
    if (!visiteur) return res.status(404).json({ message: 'Visiteur introuvable.' });
    if (visiteur.statut_suivi === 'Devenu membre') {
      return res.status(400).json({ message: 'Ce visiteur est deja devenu membre.' });
    }
    await visiteur.update({ statut_suivi: statut });
    res.json({ message: `Statut change en "${statut}".` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const modifierSeuil = async (req, res) => {
  try {
    const seuil = Number(req.body.seuil);
    if (!Number.isInteger(seuil) || seuil < 1 || seuil > 50) {
      return res.status(400).json({ message: 'Le seuil doit etre un entier entre 1 et 50.' });
    }
    await Parametre.upsert({ cle: CLE_SEUIL, valeur: String(seuil) });
    res.json({ message: 'Seuil mis a jour.', seuil });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = { listerVisiteurs, historiqueVisiteur, changerStatutVisiteur, modifierSeuil };