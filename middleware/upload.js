const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Stockage Cloudinary commun aux photos et documents des membres.
// Utilise par l'ajout/modification depuis l'administration et par
// l'inscription publique, afin que les deux flux se comportent pareil.
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

const uploadMembreFields = upload.fields([
  { name: 'photo_profil', maxCount: 1 },
  { name: 'document_identite', maxCount: 1 }
]);

module.exports = { uploadMembreFields };
