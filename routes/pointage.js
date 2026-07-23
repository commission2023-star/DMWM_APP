const express = require('express');
const router = express.Router();
const { verifierToken, verifierRole } = require('../middleware/auth');
const {
  getMembresPointage, enregistrerPointage, statsPointage,
  historiquePresences, membresAbsentsRecurrents
} = require('../controllers/pointageController');

const rolesPointage = ['Super Admin', 'Admin CA', 'Agent H', 'Agent F'];
const rolesLecture = ['Super Admin', 'Admin CA', 'PF'];

router.get('/membres', verifierToken, verifierRole(...rolesPointage), getMembresPointage);
router.post('/enregistrer', verifierToken, verifierRole(...rolesPointage), enregistrerPointage);
router.get('/stats/:programme_id', verifierToken, verifierRole(...rolesLecture), statsPointage);
router.get('/historique/:membre_id', verifierToken, verifierRole(...rolesLecture), historiquePresences);
router.get('/absents-recurrents', verifierToken, verifierRole(...rolesLecture), membresAbsentsRecurrents);

module.exports = router;
