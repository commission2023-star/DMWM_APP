const validerTelephone = (telephone) => {
  if (!telephone) return false;
  const nettoye = telephone.replace(/[\s\-]/g, '');
  return /^(\+?221)?[0-9]{9}$/.test(nettoye);
};

const validerEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validerMembre = (req, res, next) => {
  const { telephone, email } = req.body;
  if (telephone && !validerTelephone(telephone)) {
    return res.status(400).json({
      message: 'Numéro de téléphone invalide. Format attendu : 9 chiffres (ex: 771234567).'
    });
  }
  if (email && !validerEmail(email)) {
    return res.status(400).json({ message: 'Adresse email invalide.' });
  }
  next();
};

module.exports = { validerTelephone, validerEmail, validerMembre };
