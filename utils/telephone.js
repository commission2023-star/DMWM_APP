// Normalise un numero senegalais : retourne les 9 chiffres, ou null si invalide
const normaliserTelephone = (telephone) => {
  if (!telephone) return null;
  const nettoye = String(telephone).replace(/[\s\-]/g, '');
  const m = nettoye.match(/^(?:\+?221)?([0-9]{9})$/);
  return m ? m[1] : null;
};

module.exports = { normaliserTelephone };