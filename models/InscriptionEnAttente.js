const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InscriptionEnAttente = sequelize.define('InscriptionEnAttente', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type_formulaire: { type: DataTypes.ENUM('Nouveau Bachelier', 'Nouveau Adherent', 'Ancien'), allowNull: false },
  donnees: { type: DataTypes.JSON, allowNull: false },
  statut: { type: DataTypes.ENUM('En attente', 'Valide', 'Rejete'), defaultValue: 'En attente' },
  motif_rejet: { type: DataTypes.TEXT },
  valide_par: { type: DataTypes.INTEGER },
  date_traitement: { type: DataTypes.DATE }
}, { tableName: 'inscriptions_en_attente' });

module.exports = InscriptionEnAttente;
