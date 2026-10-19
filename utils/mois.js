const { Op } = require('sequelize');

// Filtre de mois fiable pour une colonne DATE : mois = "AAAA-MM" -> condition entre le 1er et le dernier jour.
// (Op.like sur une colonne DATE est converti en date par Sequelize et ne marche pas.)
const conditionMois = (mois) => {
  const m = /^(\d{4})-(\d{2})$/.exec(mois || '');
  if (!m) return null;
  const annee = Number(m[1]);
  const numero = Number(m[2]);
  if (numero < 1 || numero > 12) return null;
  const dernierJour = new Date(annee, numero, 0).getDate();
  return { [Op.between]: [`${m[1]}-${m[2]}-01`, `${m[1]}-${m[2]}-${String(dernierJour).padStart(2, '0')}`] };
};

module.exports = { conditionMois };
