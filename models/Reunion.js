const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reunion = sequelize.define('Reunion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  heure_debut: { type: DataTypes.TIME },
  heure_fin: { type: DataTypes.TIME },
  lieu: { type: DataTypes.STRING },
  ordre_du_jour: { type: DataTypes.TEXT },
  cree_par: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'reunions' });

module.exports = Reunion;
