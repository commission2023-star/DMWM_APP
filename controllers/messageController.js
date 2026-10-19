const { MessageCA, Utilisateur } = require('../models');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/messages/';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Format non supporte.'));
  }
});

const envoyerMessage = async (req, res) => {
  try {
    const { objet, contenu } = req.body;
    const expediteur = req.utilisateur;

    if (!objet) {
      return res.status(400).json({ message: 'L\'objet est obligatoire.' });
    }

    const data = {
      expediteur_id: expediteur.id,
      commission: expediteur.role,
      objet,
      contenu: contenu || '',
      statut: 'En attente'
    };

    if (req.file) {
      data.fichier_joint = '/uploads/messages/' + req.file.filename;
    }

    const message = await MessageCA.create(data);
    res.status(201).json({ message: 'Message envoye a la CA avec succes.', id: message.id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const listerMessages = async (req, res) => {
  try {
    const { statut, commission } = req.query;
    const where = {};
    if (statut) where.statut = statut;
    if (commission) where.commission = commission;

    const messages = await MessageCA.findAll({
      where,
      include: [{
        model: Utilisateur,
        attributes: ['id', 'nom', 'role'],
        foreignKey: 'expediteur_id'
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const getMessage = async (req, res) => {
  try {
    const message = await MessageCA.findByPk(req.params.id, {
      include: [{
        model: Utilisateur,
        attributes: ['id', 'nom', 'role'],
        foreignKey: 'expediteur_id'
      }]
    });
    if (!message) return res.status(404).json({ message: 'Message introuvable.' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const changerStatutMessage = async (req, res) => {
  try {
    const message = await MessageCA.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message introuvable.' });
    await message.update({ statut: req.body.statut });
    res.json({ message: 'Statut mis a jour.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const mesMessages = async (req, res) => {
  try {
    const messages = await MessageCA.findAll({
      where: { expediteur_id: req.utilisateur.id },
      order: [['created_at', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const statsMessages = async (req, res) => {
  try {
    const enAttente = await MessageCA.count({ where: { statut: 'En attente' } });
    const traites = await MessageCA.count({ where: { statut: 'Traite' } });
    const total = await MessageCA.count();
    res.json({ enAttente, traites, total });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = { envoyerMessage, listerMessages, getMessage, changerStatutMessage, mesMessages, statsMessages, upload };
