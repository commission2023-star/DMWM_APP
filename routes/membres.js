const express = require('express');
const router = express.Router();
const { verifierToken, verifierRole } = require('../middleware/auth');
const { validerMembre } = require('../middleware/validation');
const { uploadMembreFields } = require('../middleware/upload');
const {
  listerMembres, statsMembes, getMembre,
  ajouterMembre, modifierMembre, changerStatut, archiverMembre
} = require('../controllers/membreController');

const rolesLecture = ['Super Admin', 'Admin CA', 'PF'];
const rolesEcriture = ['Super Admin', 'Admin CA'];

router.get('/stats', verifierToken, statsMembes);
router.get('/', verifierToken, verifierRole(...rolesLecture), listerMembres);
router.get('/:id', verifierToken, verifierRole(...rolesLecture), getMembre);
router.post('/', verifierToken, verifierRole(...rolesEcriture), uploadMembreFields, validerMembre, ajouterMembre);
router.put('/:id', verifierToken, verifierRole(...rolesEcriture), uploadMembreFields, validerMembre, modifierMembre);
router.patch('/:id/statut', verifierToken, verifierRole(...rolesEcriture), changerStatut);
router.patch('/:id/archiver', verifierToken, verifierRole(...rolesEcriture), archiverMembre);

module.exports = router;
