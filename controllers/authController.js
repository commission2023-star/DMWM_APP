const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { identifiant, mot_de_passe } = req.body;

    if (!identifiant || !mot_de_passe) {
      return res.status(400).json({ message: 'Identifiant et mot de passe requis.' });
    }

    const utilisateur = await Utilisateur.findOne({ where: { identifiant } });

    if (!utilisateur) {
      return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect.' });
    }

    if (!utilisateur.actif) {
      return res.status(403).json({ message: 'Compte desactive. Contactez l\'administrateur.' });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiant ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role, identifiant: utilisateur.identifiant },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Connexion reussie.',
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        identifiant: utilisateur.identifiant,
        role: utilisateur.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const moProfil = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id, {
      attributes: { exclude: ['mot_de_passe'] }
    });
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const changerMotDePasse = async (req, res) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);
    const valide = await bcrypt.compare(ancien_mot_de_passe, utilisateur.mot_de_passe);

    if (!valide) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect.' });
    }

    const hash = await bcrypt.hash(nouveau_mot_de_passe, 10);
    await utilisateur.update({ mot_de_passe: hash });

    res.json({ message: 'Mot de passe modifie avec succes.' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = { login, moProfil, changerMotDePasse };
