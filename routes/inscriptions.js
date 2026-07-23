const express = require('express');
const router = express.Router();
const { verifierToken, verifierRole } = require('../middleware/auth');
const { validerTelephone } = require('../middleware/validation');
const {
  soumettre, lister, getInscription,
  valider, rejeter, modifier, stats
} = require('../controllers/inscriptionController');

const rolesCA = ['Super Admin', 'Admin CA'];

router.post('/soumettre', (req, res, next) => {
  if (req.body.telephone && !validerTelephone(req.body.telephone)) {
    return res.status(400).json({ message: 'Numéro de téléphone invalide.' });
  }
  next();
}, soumettre);
router.get('/stats', verifierToken, stats);
router.get('/', verifierToken, verifierRole(...rolesCA), lister);
router.get('/:id', verifierToken, verifierRole(...rolesCA), getInscription);
router.patch('/:id/valider', verifierToken, verifierRole(...rolesCA), valider);
router.patch('/:id/rejeter', verifierToken, verifierRole(...rolesCA), rejeter);
router.put('/:id/modifier', verifierToken, verifierRole(...rolesCA), modifier);

module.exports = router;
