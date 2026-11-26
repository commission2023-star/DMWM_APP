const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Visite = sequelize.define(
  "Visite",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    visiteur_id: { type: DataTypes.INTEGER, allowNull: false },
    programme_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "visites",
    indexes: [{ unique: true, fields: ["visiteur_id", "programme_id"] }],
  },
);

module.exports = Visite;
