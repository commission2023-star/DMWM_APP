const { Reunion, CompteRendu, Utilisateur } = require('../models');
const path = require('path');
const multer = require('multer');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'dmwm-uasz/comptes-rendus',
    resource_type: 'auto',
    public_id: (req, file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const nom = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return ext === '.pdf' ? nom : nom + ext;
    }
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Format non supporte. Utilisez PDF ou Word.'));
  }
});

const creerReunion = async (req, res) => {
  try {
    const { date, heure_debut, heure_fin, lieu, ordre_du_jour } = req.body;
    if (!date) return res.status(400).json({ message: 'La date est obligatoire.' });

    const reunion = await Reunion.create({
      date, heure_debut, heure_fin, lieu, ordre_du_jour,
      cree_par: req.utilisateur.id
    });
    res.status(201).json({ message: 'Reunion creee avec succes.', reunion });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const listerReunions = async (req, res) => {
  try {
    const reunions = await Reunion.findAll({
      include: [
        { model: CompteRendu, attributes: ['id', 'commission', 'created_at'], required: false },
        { model: Utilisateur, as: 'Createur', attributes: ['nom'], required: false }
      ],
      order: [['date', 'DESC']]
    });
    res.json(reunions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const getReunion = async (req, res) => {
  try {
    const reunion = await Reunion.findByPk(req.params.id, {
      include: [
        {
          model: CompteRendu,
          required: false,
          include: [{ model: Utilisateur, as: 'Auteur', attributes: ['nom', 'role'], required: false }]
        },
        { model: Utilisateur, as: 'Createur', attributes: ['nom'], required: false }
      ]
    });
    if (!reunion) return res.status(404).json({ message: 'Reunion introuvable.' });
    res.json(reunion);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const modifierReunion = async (req, res) => {
  try {
    const reunion = await Reunion.findByPk(req.params.id);
    if (!reunion) return res.status(404).json({ message: 'Reunion introuvable.' });
    await reunion.update(req.body);
    res.json({ message: 'Reunion modifiee avec succes.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const ajouterCompteRendu = async (req, res) => {
  try {
    const reunion = await Reunion.findByPk(req.params.id);
    if (!reunion) return res.status(404).json({ message: 'Reunion introuvable.' });

    const data = {
      reunion_id: req.params.id,
      auteur_id: req.utilisateur.id,
      commission: req.utilisateur.role,
      contenu: req.body.contenu || ''
    };

    if (req.file) {
      data.fichier = req.file.path;
    }

    if (!data.contenu && !data.fichier) {
      return res.status(400).json({ message: 'Un contenu ou un fichier est obligatoire.' });
    }

    const cr = await CompteRendu.create(data);
    res.status(201).json({ message: 'Compte rendu ajoute avec succes.', id: cr.id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const supprimerCompteRendu = async (req, res) => {
  try {
    const cr = await CompteRendu.findByPk(req.params.cr_id);
    if (!cr) return res.status(404).json({ message: 'Compte rendu introuvable.' });
    await cr.destroy();
    res.json({ message: 'Compte rendu supprime.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = { creerReunion, listerReunions, getReunion, modifierReunion, ajouterCompteRendu, supprimerCompteRendu, upload };
