const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  identifiant: { type: DataTypes.STRING, allowNull: false, unique: true },
  mot_de_passe: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('Super Admin', 'Admin CA', 'Agent H', 'Agent F', 'PF', 'CIPS', 'CTC', 'CL'), allowNull: false },
  actif: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'utilisateurs' });

module.exports = Utilisateur;
