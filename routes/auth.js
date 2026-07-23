const express = require('express');
const router = express.Router();
const { login, moProfil, changerMotDePasse } = require('../controllers/authController');
const { verifierToken } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', verifierToken, moProfil);
router.put('/changer-mot-de-passe', verifierToken, changerMotDePasse);

module.exports = router;
