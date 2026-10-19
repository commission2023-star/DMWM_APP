const { Programme } = require('../models');
const { Op } = require('sequelize');
const { conditionMois } = require('../utils/mois');

const genererProgrammesRecurrents = async () => {
  const aujourd_hui = new Date();
  const lundi = new Date(aujourd_hui);
  lundi.setDate(aujourd_hui.getDate() - aujourd_hui.getDay() + 1);

  const recurrents = [
    { jour: 2, type: 'Enseignement', heure_debut: '21:00:00', heure_fin: '23:00:00' },
    { jour: 4, type: 'Goudy Aldiouma', heure_debut: '21:00:00', heure_fin: '23:30:00' },
    { jour: 5, type: 'Xadara', heure_debut: '14:00:00', heure_fin: '16:00:00' }
  ];

  for (const r of recurrents) {
    const date = new Date(lundi);
    date.setDate(lundi.getDate() + r.jour - 1);
    const dateStr = date.toISOString().split('T')[0];

    const existe = await Programme.findOne({
      where: { type: r.type, date: dateStr }
    });

    if (!existe) {
      await Programme.create({
        type: r.type,
        date: dateStr,
        heure_debut: r.heure_debut,
        heure_fin: r.heure_fin,
        recurrent: true,
        statut: 'Planifie'
      });
    }
  }
};

const listerProgrammes = async (req, res) => {
  try {
    await genererProgrammesRecurrents();

    const { statut, type, mois } = req.query;
    const where = {};

    if (statut) where.statut = statut;
    if (type) where.type = type;
    const filtreMois = conditionMois(mois);
    if (filtreMois) where.date = filtreMois;

    const programmes = await Programme.findAll({
      where,
      order: [['date', 'ASC']]
    });

    res.json(programmes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const getProgramme = async (req, res) => {
  try {
    const programme = await Programme.findByPk(req.params.id);
    if (!programme) return res.status(404).json({ message: 'Programme introuvable.' });
    res.json(programme);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const creerProgramme = async (req, res) => {
  try {
    const programme = await Programme.create({
      ...req.body,
      recurrent: false,
      statut: req.body.statut || 'Planifie'
    });
    res.status(201).json({ message: 'Programme cree avec succes.', programme });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const modifierProgramme = async (req, res) => {
  try {
    const programme = await Programme.findByPk(req.params.id);
    if (!programme) return res.status(404).json({ message: 'Programme introuvable.' });
    await programme.update(req.body);
    res.json({ message: 'Programme modifie avec succes.', programme });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const changerStatut = async (req, res) => {
  try {
    const programme = await Programme.findByPk(req.params.id);
    if (!programme) return res.status(404).json({ message: 'Programme introuvable.' });
    await programme.update({ statut: req.body.statut });
    res.json({ message: `Statut change en "${req.body.statut}".` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const supprimerProgramme = async (req, res) => {
  try {
    const programme = await Programme.findByPk(req.params.id);
    if (!programme) return res.status(404).json({ message: 'Programme introuvable.' });
    if (programme.recurrent) {
      return res.status(400).json({ message: 'Impossible de supprimer un programme recurrent.' });
    }
    await programme.destroy();
    res.json({ message: 'Programme supprime.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const prochainProgramme = async (req, res) => {
  try {
    await genererProgrammesRecurrents();
    const aujourd_hui = new Date().toISOString().split('T')[0];
    const programme = await Programme.findOne({
      where: {
        date: { [Op.gte]: aujourd_hui },
        statut: 'Planifie'
      },
      order: [['date', 'ASC']]
    });
    res.json(programme || null);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = {
  listerProgrammes, getProgramme, creerProgramme,
  modifierProgramme, changerStatut, supprimerProgramme, prochainProgramme
};
