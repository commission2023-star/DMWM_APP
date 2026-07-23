const express = require('express');
const router = express.Router();
const { verifierToken, verifierRole } = require('../middleware/auth');
const { statistiquesVisuelles, genererRapportPDF, genererRapportExcel } = require('../controllers/rapportController');

const rolesRapports = ['Super Admin', 'Admin CA', 'PF'];

router.get('/statistiques', verifierToken, verifierRole(...rolesRapports), statistiquesVisuelles);
router.get('/pdf', verifierToken, verifierRole(...rolesRapports), genererRapportPDF);
router.get('/excel', verifierToken, verifierRole(...rolesRapports), genererRapportExcel);

module.exports = router;