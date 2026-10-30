const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifierToken, verifierRole } = require('../middleware/auth');
const { validerMembre } = require('../middleware/validation');
const {
  listerMembres, statsMembes, getMembre,
  ajouterMembre, modifierMembre, changerStatut, archiverMembre
} = require('../controllers/membreController');

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Où et comment ranger les fichiers : chez Cloudinary, dans le dossier "dmwm-uasz/membres"
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'dmwm-uasz/membres',
    resource_type: 'auto'
  }
}); 

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Format non supporte. Utilisez JPG, PNG ou PDF.'));
  }
});
/*
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Format non supporte. Utilisez JPG, PNG ou PDF.'));
  }
});
*/
const uploadFields = upload.fields([
  { name: 'photo_profil', maxCount: 1 },
  { name: 'document_identite', maxCount: 1 }
]);

const rolesLecture = ['Super Admin', 'Admin CA', 'PF'];
const rolesEcriture = ['Super Admin', 'Admin CA'];

router.get('/stats', verifierToken, statsMembes);
router.get('/', verifierToken, verifierRole(...rolesLecture), listerMembres);
router.get('/:id', verifierToken, verifierRole(...rolesLecture), getMembre);
router.post('/', verifierToken, verifierRole(...rolesEcriture), uploadFields, validerMembre, ajouterMembre);
router.put('/:id', verifierToken, verifierRole(...rolesEcriture), uploadFields, validerMembre, modifierMembre);
router.patch('/:id/statut', verifierToken, verifierRole(...rolesEcriture), changerStatut);
router.patch('/:id/archiver', verifierToken, verifierRole(...rolesEcriture), archiverMembre);

module.exports = router;
