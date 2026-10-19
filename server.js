const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/utilisateurs', require('./routes/utilisateurs'));
app.use('/api/membres', require('./routes/membres'));
app.use('/api/inscriptions', require('./routes/inscriptions'));
app.use('/api/programmes', require('./routes/programmes'));
app.use('/api/pointage', require('./routes/pointage'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reunions', require('./routes/reunions'));
app.use('/api/rapports', require('./routes/rapports'));

// Route test
app.get('/', (req, res) => {
  res.send('Serveur DMWM-UASZ operationnel');
});

// Gestion claire des erreurs Multer (fichier trop lourd, mauvais format)
app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux (max 5 Mo pour les membres, 10 Mo pour messages et comptes rendus).' });
    }
    return res.status(400).json({ message: "Erreur lors de l'upload du fichier." });
  }
  if (err && err.message && err.message.includes('Format non supporte')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
});
