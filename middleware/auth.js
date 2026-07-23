const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifierToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acces refuse. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide ou expire.' });
  }
};

const verifierRole = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({ 
        message: 'Acces refuse. Vous n\'avez pas les droits necessaires.' 
      });
    }
    next();
  };
};

module.exports = { verifierToken, verifierRole };
