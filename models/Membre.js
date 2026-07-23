const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Membre = sequelize.define('Membre', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  prenom: { type: DataTypes.STRING, allowNull: false },
  nom: { type: DataTypes.STRING, allowNull: false },
  sexe: { type: DataTypes.ENUM('H', 'F'), allowNull: false },
  date_naissance: { type: DataTypes.DATEONLY },
  lieu_naissance: { type: DataTypes.STRING },
  adresse: { type: DataTypes.STRING },
  telephone: { type: DataTypes.STRING, unique: true },
  email: { type: DataTypes.STRING },
  photo_profil: { type: DataTypes.STRING },
  document_identite: { type: DataTypes.STRING },
  tuteur_nom: { type: DataTypes.STRING },
  tuteur_telephone: { type: DataTypes.STRING },
  filiere: { type: DataTypes.STRING },
  niveau: { type: DataTypes.STRING },
  region_origine: { type: DataTypes.STRING },
  departement: { type: DataTypes.STRING },
  arrondissement: { type: DataTypes.STRING },
  commune: { type: DataTypes.STRING },
  comite_origine: { type: DataTypes.STRING },
  conseil_origine: { type: DataTypes.STRING },
  section_base: { type: DataTypes.STRING },
  pf_nom: { type: DataTypes.STRING },
  pf_telephone: { type: DataTypes.STRING },
  poste_section_base: { type: DataTypes.ENUM('PF', 'CA', 'CIPS', 'CL', 'CTC', 'Aucun') },
  categorie: { type: DataTypes.ENUM('Nouveau Bachelier', 'Nouveau Adherent', 'Ancien'), allowNull: false },
  commission: { type: DataTypes.ENUM('PF', 'CA', 'CIPS', 'CTC', 'CL', 'Membre simple'), defaultValue: 'Membre simple' },
  date_adhesion: { type: DataTypes.DATEONLY },
  statut: { type: DataTypes.ENUM('Nouveau', 'Confirme', 'Inactif'), defaultValue: 'Nouveau' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'membres' });

module.exports = Membre;
