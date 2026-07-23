const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Programme = sequelize.define('Programme', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.ENUM('Goudy Aldiouma', 'Xadara', 'Enseignement', 'Autre'), allowNull: false },
  nom: { type: DataTypes.STRING },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  heure_debut: { type: DataTypes.TIME },
  heure_fin: { type: DataTypes.TIME },
  lieu: { type: DataTypes.STRING },
  oustaze: { type: DataTypes.STRING },
  theme: { type: DataTypes.TEXT },
  recurrent: { type: DataTypes.BOOLEAN, defaultValue: false },
  statut: { type: DataTypes.ENUM('Planifie', 'Tenu', 'Annule'), defaultValue: 'Planifie' }
}, { tableName: 'programmes' });

module.exports = Programme;
