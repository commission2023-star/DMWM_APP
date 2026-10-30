const { Membre } = require('../models');
const { Op } = require('sequelize');


const listerMembres = async (req, res) => {
  try {
    const { statut, sexe, commission, categorie, q } = req.query;
    const where = {};

    if (statut) where.statut = statut;
    if (sexe) where.sexe = sexe;
    if (commission) where.commission = commission;
    if (categorie) where.categorie = categorie;
    if (q) {
      where[Op.or] = [
        { prenom: { [Op.like]: `%${q}%` } },
        { nom: { [Op.like]: `%${q}%` } },
        { telephone: { [Op.like]: `%${q}%` } },
        { filiere: { [Op.like]: `%${q}%` } }
      ];
    }

    const membres = await Membre.findAll({
      where,
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    res.json(membres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const statsMembes = async (req, res) => {
  try {
    const total = await Membre.count({ where: { statut: { [Op.ne]: 'Inactif' } } });
    const nouveaux = await Membre.count({ where: { statut: 'Nouveau' } });
    const hommes = await Membre.count({ where: { sexe: 'H', statut: { [Op.ne]: 'Inactif' } } });
    const femmes = await Membre.count({ where: { sexe: 'F', statut: { [Op.ne]: 'Inactif' } } });
    const inactifs = await Membre.count({ where: { statut: 'Inactif' } });

    res.json({ total, nouveaux, hommes, femmes, inactifs, absents: 0, enAttente: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const getMembre = async (req, res) => {
  try {
    const membre = await Membre.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });
    res.json(membre);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const ajouterMembre = async (req, res) => {
  try {
    const data = { ...req.body };

    // Cloudinary renvoie directement l'URL complète dans "path"
    if (req.files?.photo_profil) {
      data.photo_profil = req.files.photo_profil[0].path;
    }
    if (req.files?.document_identite) {
      data.document_identite = req.files.document_identite[0].path;
    }
    if (data.telephone) {
      const existe = await Membre.findOne({ where: { telephone: data.telephone } });
      if (existe) return res.status(400).json({ message: 'Ce numero de telephone est deja enregistre.' });
    }

    const membre = await Membre.create(data);
    res.status(201).json({ message: 'Membre ajoute avec succes.', membre });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const modifierMembre = async (req, res) => {
  try {
    const membre = await Membre.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });

    const data = { ...req.body };

    // Doublon telephone : refuser si un AUTRE membre a deja ce numero
    if (data.telephone && data.telephone !== membre.telephone) {
      const existe = await Membre.findOne({ where: { telephone: data.telephone } });
      if (existe) return res.status(400).json({ message: 'Ce numero de telephone est deja utilise par un autre membre.' });
    }

    // Cloudinary renvoie directement l'URL complète dans "path"
    if (req.files?.photo_profil) {
      data.photo_profil = req.files.photo_profil[0].path;
    }
    if (req.files?.document_identite) {
      data.document_identite = req.files.document_identite[0].path;
    }
    await membre.update(data);
    res.json({ message: 'Membre modifie avec succes.', membre });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const changerStatut = async (req, res) => {
  try {
    const membre = await Membre.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });

    const { statut } = req.body;
    await membre.update({ statut });
    res.json({ message: `Statut change en "${statut}".` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const archiverMembre = async (req, res) => {
  try {
    const membre = await Membre.findByPk(req.params.id);
    if (!membre) return res.status(404).json({ message: 'Membre introuvable.' });

    await membre.update({ statut: 'Inactif' });
    res.json({ message: 'Membre archive avec succes.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = { listerMembres, statsMembes, getMembre, ajouterMembre, modifierMembre, changerStatut, archiverMembre };
