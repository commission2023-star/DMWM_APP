const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Presence = sequelize.define('Presence', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  membre_id: { type: DataTypes.INTEGER, allowNull: false },
  programme_id: { type: DataTypes.INTEGER, allowNull: false },
  statut: { type: DataTypes.ENUM('Present', 'Absent'), allowNull: false },
  sync_status: { type: DataTypes.ENUM('Local', 'Synchronise'), defaultValue: 'Synchronise' }
}, { tableName: 'presences' });

module.exports = Presence;
