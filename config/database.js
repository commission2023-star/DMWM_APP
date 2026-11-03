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
pool: { max: 5, min: 0, acquire: 60000, idle: 10000 },
retry: {
  max: 5,
  backoffBase: 2000,
  backoffExponent: 1.5,
  match: [
    /ETIMEDOUT/,
    /ECONNRESET/,
    /ECONNREFUSED/,
    /EHOSTUNREACH/,
    /PROTOCOL_CONNECTION_LOST/,
    /SequelizeConnectionError/,
    /SequelizeConnectionRefusedError/,
    /SequelizeHostNotReachableError/,
    /SequelizeConnectionTimedOutError/
  ]
}
  }
);

sequelize.authenticate()
  .then(() => console.log('Base de donnees connectee'))
  .catch(err => console.error('Erreur connexion DB (apres plusieurs essais):', err.message));

module.exports = sequelize;
