const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Visiteur = sequelize.define(
  "Visiteur",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    prenom: { type: DataTypes.STRING, allowNull: false },
    nom: { type: DataTypes.STRING, allowNull: false },
    telephone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    statut_suivi: {
      type: DataTypes.ENUM("A contacter", "Contacte", "Devenu membre"),
      allowNull: false,
      defaultValue: "A contacter",
    },
    membre_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "visiteurs" },
);

module.exports = Visiteur;
