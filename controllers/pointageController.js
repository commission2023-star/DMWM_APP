const { Presence, Membre, Programme } = require('../models');
const { Op } = require('sequelize');

const getMembresPointage = async (req, res) => {
  try {
    const { programme_id, sexe } = req.query;

    if (!programme_id) {
      return res.status(400).json({ message: 'programme_id requis.' });
    }

    const where = { statut: { [Op.ne]: 'Inactif' } };
    if (sexe) where.sexe = sexe;

    const membres = await Membre.findAll({
      where,
      order: [['nom', 'ASC'], ['prenom', 'ASC']],
      attributes: ['id', 'prenom', 'nom', 'sexe', 'telephone', 'filiere', 'niveau', 'commission']
    });

    const presences = await Presence.findAll({
      where: { programme_id }
    });

    const presencesMap = {};
    presences.forEach(p => {
      presencesMap[p.membre_id] = p.statut;
    });

    const membresAvecStatut = membres.map(m => ({
      ...m.toJSON(),
      presence: presencesMap[m.id] || null
    }));

    res.json(membresAvecStatut);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const enregistrerPointage = async (req, res) => {
  try {
    const { programme_id, pointages } = req.body;

    if (!programme_id || !pointages || !Array.isArray(pointages)) {
      return res.status(400).json({ message: 'Donnees invalides.' });
    }

    const programme = await Programme.findByPk(programme_id);
    if (!programme) {
      return res.status(404).json({ message: 'Programme introuvable.' });
    }

    let crees = 0;
    let modifies = 0;

    for (const p of pointages) {
      const [presence, created] = await Presence.findOrCreate({
        where: { membre_id: p.membre_id, programme_id },
        defaults: {
          statut: p.statut,
          sync_status: 'Synchronise'
        }
      });

      if (!created) {
        await presence.update({ statut: p.statut, sync_status: 'Synchronise' });
        modifies++;
      } else {
        crees++;
      }
    }

    await programme.update({ statut: 'Tenu' });

    res.json({
      message: `Pointage enregistre. ${crees} crees, ${modifies} mis a jour.`,
      total: pointages.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const statsPointage = async (req, res) => {
  try {
    const { programme_id } = req.params;

    const presents = await Presence.count({
      where: { programme_id, statut: 'Present' }
    });
    const absents = await Presence.count({
      where: { programme_id, statut: 'Absent' }
    });
    const total = presents + absents;
    const taux = total > 0 ? Math.round((presents / total) * 100) : 0;

    res.json({ presents, absents, total, taux });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const historiquePresences = async (req, res) => {
  try {
    const { membre_id } = req.params;

    const presences = await Presence.findAll({
      where: { membre_id },
      include: [{ model: Programme, attributes: ['id', 'type', 'date', 'lieu'] }],
      order: [[Programme, 'date', 'DESC']]
    });

    res.json(presences);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const membresAbsentsRecurrents = async (req, res) => {
  try {
    const derniersProgammes = await Programme.findAll({
      where: { statut: 'Tenu' },
      order: [['date', 'DESC']],
      limit: 5,
      attributes: ['id', 'date', 'type']
    });

    if (derniersProgammes.length < 2) {
      return res.json([]);
    }

    const membres = await Membre.findAll({
      where: { statut: { [Op.ne]: 'Inactif' } },
      attributes: ['id', 'prenom', 'nom', 'telephone', 'sexe']
    });

    const membresAbsents = [];

    for (const membre of membres) {
      let absencesConsecutives = 0;

      for (const prog of derniersProgammes) {
        const presence = await Presence.findOne({
          where: { membre_id: membre.id, programme_id: prog.id }
        });

        if (!presence || presence.statut === 'Absent') {
          absencesConsecutives++;
        } else {
          break;
        }
      }

      if (absencesConsecutives >= 2) {
        membresAbsents.push({
          ...membre.toJSON(),
          absences_consecutives: absencesConsecutives
        });
      }
    }

    membresAbsents.sort((a, b) => b.absences_consecutives - a.absences_consecutives);
    res.json(membresAbsents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = {
  getMembresPointage, enregistrerPointage, statsPointage,
  historiquePresences, membresAbsentsRecurrents
};
