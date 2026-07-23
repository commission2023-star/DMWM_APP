require('dotenv').config();
const { sequelize, Membre, Utilisateur, Programme, 
        Presence, InscriptionEnAttente, MessageCA, 
        Reunion, CompteRendu } = require('./models');
const bcrypt = require('bcryptjs');

async function syncDatabase() {
  try {
    console.log('Synchronisation des tables...');
    
    await sequelize.sync({ force: false });
    console.log('Toutes les tables sont creees !');

    const adminExiste = await Utilisateur.findOne({ 
      where: { role: 'Super Admin' } 
    });

    if (!adminExiste) {
      const hash = await bcrypt.hash('Admin@2025', 10);
      await Utilisateur.create({
        nom: 'Super Administrateur',
        identifiant: 'superadmin',
        mot_de_passe: hash,
        role: 'Super Admin',
        actif: true
      });
      console.log('Super Admin cree !');
      console.log('   Identifiant : superadmin');
      console.log('   Mot de passe : Admin@2025');
      console.log('   Changez ce mot de passe apres la premiere connexion !');
    } else {
      console.log('Super Admin deja existant.');
    }

  } catch (error) {
    console.error('Erreur :', error.message);
  } finally {
    await sequelize.close();
    console.log('Connexion fermee.');
  }
}

syncDatabase();
