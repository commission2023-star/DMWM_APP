// Validation simple d'un numero de telephone senegalais (9 chiffres, +221 optionnel)
const validerTelephone = (telephone) => {
  if (!telephone) return false;
  const nettoye = String(telephone).replace(/[\s\-]/g, '');
  return /^(\+?221)?[0-9]{9}$/.test(nettoye);
};

// Email optionnel : vide accepte, sinon format basique
const validerEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validerMembre = (req, res, next) => {
  const { telephone, email } = req.body;
  if (telephone && !validerTelephone(telephone)) {
    return res.status(400).json({ message: 'Numero de telephone invalide. Format attendu : 9 chiffres (ex: 771234567).' });
  }
  if (email && !validerEmail(email)) {
    return res.status(400).json({ message: 'Adresse email invalide.' });
  }
  next();
};

module.exports = { validerTelephone, validerEmail, validerMembre };
