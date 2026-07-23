const express = require('express');
const router = express.Router();
const { verifierToken, verifierRole } = require('../middleware/auth');
const {
  envoyerMessage, listerMessages, getMessage,
  changerStatutMessage, mesMessages, statsMessages, upload
} = require('../controllers/messageController');

const rolesCA = ['Super Admin', 'Admin CA'];
const rolesBureau = ['Super Admin', 'Admin CA', 'PF', 'CIPS', 'CTC', 'CL'];

router.get('/stats', verifierToken, verifierRole(...rolesCA), statsMessages);
router.get('/mes-messages', verifierToken, mesMessages);
router.get('/', verifierToken, verifierRole(...rolesCA, 'PF'), listerMessages);
router.get('/:id', verifierToken, verifierRole(...rolesCA, 'PF'), getMessage);
router.post('/', verifierToken, verifierRole(...rolesBureau), upload.single('fichier_joint'), envoyerMessage);
router.patch('/:id/statut', verifierToken, verifierRole(...rolesCA), changerStatutMessage);

module.exports = router;
