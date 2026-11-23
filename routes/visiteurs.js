const express = require('express');
const router = express.Router();
const { verifierToken, verifierRole } = require('../middleware/auth');
const {
  listerVisiteurs, historiqueVisiteur, changerStatutVisiteur, modifierSeuil
} = require('../controllers/visiteurController');

const rolesLecture = ['Super Admin', 'Admin CA', 'PF'];
const rolesGestion = ['Super Admin', 'Admin CA'];

router.get('/', verifierToken, verifierRole(...rolesLecture), listerVisiteurs);
router.get('/:id/historique', verifierToken, verifierRole(...rolesLecture), historiqueVisiteur);
router.put('/seuil', verifierToken, verifierRole(...rolesGestion), modifierSeuil);
router.patch('/:id/statut', verifierToken, verifierRole(...rolesGestion), changerStatutVisiteur);

module.exports = router;