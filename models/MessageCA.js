const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageCA = sequelize.define('MessageCA', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  expediteur_id: { type: DataTypes.INTEGER, allowNull: false },
  commission: { type: DataTypes.STRING, allowNull: false },
  objet: { type: DataTypes.STRING, allowNull: false },
  contenu: { type: DataTypes.TEXT },
  fichier_joint: { type: DataTypes.STRING },
  statut: { type: DataTypes.ENUM('En attente', 'Traite'), defaultValue: 'En attente' }
}, { tableName: 'messages_ca' });

module.exports = MessageCA;
