const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompteRendu = sequelize.define('CompteRendu', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reunion_id: { type: DataTypes.INTEGER, allowNull: false },
  auteur_id: { type: DataTypes.INTEGER, allowNull: false },
  commission: { type: DataTypes.STRING, allowNull: false },
  contenu: { type: DataTypes.TEXT },
  fichier: { type: DataTypes.STRING }
}, { tableName: 'comptes_rendus' });

module.exports = CompteRendu;
