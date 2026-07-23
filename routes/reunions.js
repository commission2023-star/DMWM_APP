const express = require('express');
const router = express.Router();
const { verifierToken, verifierRole } = require('../middleware/auth');
const {
  creerReunion, listerReunions, getReunion,
  modifierReunion, ajouterCompteRendu, supprimerCompteRendu, upload
} = require('../controllers/reunionController');

const rolesCA = ['Super Admin', 'Admin CA'];
const rolesBureau = ['Super Admin', 'Admin CA', 'PF', 'CIPS', 'CTC', 'CL'];

router.get('/', verifierToken, verifierRole(...rolesBureau), listerReunions);
router.get('/:id', verifierToken, verifierRole(...rolesBureau), getReunion);
router.post('/', verifierToken, verifierRole(...rolesCA), creerReunion);
router.put('/:id', verifierToken, verifierRole(...rolesCA), modifierReunion);
router.post('/:id/comptes-rendus', verifierToken, verifierRole(...rolesBureau), upload.single('fichier'), ajouterCompteRendu);
router.delete('/:id/comptes-rendus/:cr_id', verifierToken, verifierRole(...rolesCA), supprimerCompteRendu);

module.exports = router;
