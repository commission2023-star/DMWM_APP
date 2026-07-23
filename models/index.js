const sequelize = require('../config/database');
const Membre = require('./Membre');
const Utilisateur = require('./Utilisateur');
const Programme = require('./Programme');
const Presence = require('./Presence');
const InscriptionEnAttente = require('./InscriptionEnAttente');
const MessageCA = require('./MessageCA');
const Reunion = require('./Reunion');
const CompteRendu = require('./CompteRendu');

// Relations Presence
Presence.belongsTo(Membre, { foreignKey: 'membre_id', constraints: false });
Presence.belongsTo(Programme, { foreignKey: 'programme_id', constraints: false });
Membre.hasMany(Presence, { foreignKey: 'membre_id', constraints: false });
Programme.hasMany(Presence, { foreignKey: 'programme_id', constraints: false });

// Relations Reunion
Reunion.belongsTo(Utilisateur, { foreignKey: 'cree_par', as: 'Createur', constraints: false });

// Relations CompteRendu
CompteRendu.belongsTo(Reunion, { foreignKey: 'reunion_id', constraints: false });
CompteRendu.belongsTo(Utilisateur, { foreignKey: 'auteur_id', as: 'Auteur', constraints: false });
Reunion.hasMany(CompteRendu, { foreignKey: 'reunion_id', constraints: false });

// Relations MessageCA
MessageCA.belongsTo(Utilisateur, { foreignKey: 'expediteur_id', constraints: false });

module.exports = { sequelize, Membre, Utilisateur, Programme, Presence, InscriptionEnAttente, MessageCA, Reunion, CompteRendu };
