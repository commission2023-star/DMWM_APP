const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Parametre = sequelize.define(
  "Parametre",
  {
    cle: { type: DataTypes.STRING(50), primaryKey: true },
    valeur: { type: DataTypes.STRING(100), allowNull: false },
  },
  { tableName: "parametres" },
);

module.exports = Parametre;
