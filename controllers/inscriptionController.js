const { InscriptionEnAttente } = require('../models');

const soumettre = async (req, res) => {
  try {
    const { type_formulaire, ...donnees } = req.body;

    if (!type_formulaire) {
      return res.status(400).json({ message: 'Type de formulaire requis.' });
    }

    const inscription = await InscriptionEnAttente.create({
      type_formulaire,
      donnees,
      statut: 'En attente'
    });

    res.status(201).json({
      message: 'Votre inscription a ete soumise avec succes. La Commission Administrative va examiner votre dossier.',
      id: inscription.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const lister = async (req, res) => {
  try {
    const { statut, type_formulaire } = req.query;
    const where = {};
    if (statut) where.statut = statut;
    if (type_formulaire) where.type_formulaire = type_formulaire;

    const inscriptions = await InscriptionEnAttente.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.json(inscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const getInscription = async (req, res) => {
  try {
    const inscription = await InscriptionEnAttente.findByPk(req.params.id);
    if (!inscription) return res.status(404).json({ message: 'Inscription introuvable.' });
    res.json(inscription);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const valider = async (req, res) => {
  try {
    const inscription = await InscriptionEnAttente.findByPk(req.params.id);
    if (!inscription) return res.status(404).json({ message: 'Inscription introuvable.' });
    if (inscription.statut !== 'En attente') {
      return res.status(400).json({ message: 'Cette inscription a deja ete traitee.' });
    }

    const { Membre } = require('../models');
    const donnees = inscription.donnees;

    if (donnees.telephone) {
      const existe = await Membre.findOne({ where: { telephone: donnees.telephone } });
      if (existe) {
        return res.status(400).json({ message: 'Un membre avec ce numero de telephone existe deja.' });
      }
    }

    const statut = inscription.type_formulaire === 'Ancien' ? 'Confirme' : 'Nouveau';

    const membre = await Membre.create({
      ...donnees,
      categorie: inscription.type_formulaire,
      statut,
      date_adhesion: new Date()
    });

    await inscription.update({
      statut: 'Valide',
      valide_par: req.utilisateur.id,
      date_traitement: new Date()
    });

    res.json({
      message: 'Inscription validee. Le membre a ete ajoute a la base de donnees.',
      membre_id: membre.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const rejeter = async (req, res) => {
  try {
    const inscription = await InscriptionEnAttente.findByPk(req.params.id);
    if (!inscription) return res.status(404).json({ message: 'Inscription introuvable.' });
    if (inscription.statut !== 'En attente') {
      return res.status(400).json({ message: 'Cette inscription a deja ete traitee.' });
    }

    const { motif_rejet } = req.body;

    if (!motif_rejet || !motif_rejet.trim()) {
      return res.status(400).json({ message: 'Un motif de rejet est obligatoire.' });
    }

    await inscription.update({
      statut: 'Rejete',
      motif_rejet: motif_rejet.trim(),
      valide_par: req.utilisateur.id,
      date_traitement: new Date()
    });

    res.json({ message: 'Inscription rejetee.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const modifier = async (req, res) => {
  try {
    const inscription = await InscriptionEnAttente.findByPk(req.params.id);
    if (!inscription) return res.status(404).json({ message: 'Inscription introuvable.' });

    const { donnees } = req.body;
    await inscription.update({ donnees });

    res.json({ message: 'Inscription modifiee avec succes.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const stats = async (req, res) => {
  try {
    const enAttente = await InscriptionEnAttente.count({ where: { statut: 'En attente' } });
    const valides = await InscriptionEnAttente.count({ where: { statut: 'Valide' } });
    const rejetes = await InscriptionEnAttente.count({ where: { statut: 'Rejete' } });
    const total = await InscriptionEnAttente.count();

    res.json({ enAttente, valides, rejetes, total });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = { soumettre, lister, getInscription, valider, rejeter, modifier, stats };
