const express = require('express');
const router = express.Router();
const { listerUtilisateurs, creerUtilisateur, toggleActif, modifierUtilisateur } = require('../controllers/utilisateurController');
const { verifierToken, verifierRole } = require('../middleware/auth');

router.get('/', verifierToken, verifierRole('Super Admin'), listerUtilisateurs);
router.post('/', verifierToken, verifierRole('Super Admin'), creerUtilisateur);
router.put('/:id', verifierToken, verifierRole('Super Admin'), modifierUtilisateur);
router.patch('/:id/toggle', verifierToken, verifierRole('Super Admin'), toggleActif);

module.exports = router;
