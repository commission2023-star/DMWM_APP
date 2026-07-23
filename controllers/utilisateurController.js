const bcrypt = require('bcryptjs');
const { Utilisateur } = require('../models');

const listerUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.findAll({
      attributes: { exclude: ['mot_de_passe'] }
    });
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const creerUtilisateur = async (req, res) => {
  try {
    const { nom, identifiant, mot_de_passe, role } = req.body;
    const existe = await Utilisateur.findOne({ where: { identifiant } });
    if (existe) return res.status(400).json({ message: 'Cet identifiant existe deja.' });

    const hash = await bcrypt.hash(mot_de_passe, 10);
    const utilisateur = await Utilisateur.create({ nom, identifiant, mot_de_passe: hash, role });
    res.status(201).json({ message: 'Compte cree avec succes.', utilisateur: { id: utilisateur.id, nom, identifiant, role } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const toggleActif = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    await utilisateur.update({ actif: !utilisateur.actif });
    res.json({ message: `Compte ${utilisateur.actif ? 'active' : 'desactive'}.` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const modifierUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    const { nom, role } = req.body;
    await utilisateur.update({ nom, role });
    res.json({ message: 'Compte modifie avec succes.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = { listerUtilisateurs, creerUtilisateur, toggleActif, modifierUtilisateur };
