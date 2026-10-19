const { Sequelize } = require('sequelize');
require('dotenv').config();

// SSL obligatoire pour Aiven (base distante), inutile pour WAMP en local
const hoteLocal = ['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST);
const utiliserSSL = process.env.DB_SSL ? process.env.DB_SSL === 'true' : !hoteLocal;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: { timestamps: true, underscored: true },
    dialectOptions: utiliserSSL
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : { charset: 'utf8mb4' },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

sequelize.authenticate()
  .then(() => console.log('Base de donnees connectee'))
  .catch(err => console.error('Erreur connexion DB:', err.message));

module.exports = sequelize;
