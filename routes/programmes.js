const express = require('express');
const router = express.Router();
const { verifierToken, verifierRole } = require('../middleware/auth');
const {
  listerProgrammes, getProgramme, creerProgramme,
  modifierProgramme, changerStatut, supprimerProgramme, prochainProgramme
} = require('../controllers/programmeController');

const rolesLecture = ['Super Admin', 'Admin CA', 'PF', 'CIPS', 'CTC', 'CL', 'Agent H', 'Agent F'];
const rolesEcriture = ['Super Admin', 'Admin CA'];

router.get('/prochain', verifierToken, prochainProgramme);
router.get('/', verifierToken, verifierRole(...rolesLecture), listerProgrammes);
router.get('/:id', verifierToken, verifierRole(...rolesLecture), getProgramme);
router.post('/', verifierToken, verifierRole(...rolesEcriture), creerProgramme);
router.put('/:id', verifierToken, verifierRole(...rolesEcriture), modifierProgramme);
router.patch('/:id/statut', verifierToken, verifierRole(...rolesEcriture), changerStatut);
router.delete('/:id', verifierToken, verifierRole(...rolesEcriture), supprimerProgramme);

module.exports = router;
