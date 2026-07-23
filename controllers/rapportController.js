const { Membre, Programme, Presence, InscriptionEnAttente } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const getDonneesRapport = async (filtres) => {
  const { mois, type_programme, sexe, commission } = filtres;

  const whereProgramme = {};
  if (mois) whereProgramme.date = { [Op.like]: `${mois}%` };
  if (type_programme) whereProgramme.type = type_programme;

  const programmes = await Programme.findAll({ where: whereProgramme, order: [['date', 'ASC']] });
  const programmeIds = programmes.map(p => p.id);

  const wherePresence = { programme_id: { [Op.in]: programmeIds } };
  const presences = await Presence.findAll({
    where: wherePresence,
    include: [
      { model: Membre, attributes: ['id', 'prenom', 'nom', 'sexe', 'commission'] },
      { model: Programme, attributes: ['id', 'type', 'date'] }
    ]
  });

  let presencesFiltrees = presences;
  if (sexe) presencesFiltrees = presencesFiltrees.filter(p => p.Membre?.sexe === sexe);
  if (commission) presencesFiltrees = presencesFiltrees.filter(p => p.Membre?.commission === commission);

  const whereMembre = {};
  if (mois) whereMembre.date_adhesion = { [Op.like]: `${mois}%` };
  const nouveauxMembres = await Membre.findAll({ where: { ...whereMembre, statut: 'Nouveau' } });

  return { programmes, presences: presencesFiltrees, nouveauxMembres };
};

const statistiquesVisuelles = async (req, res) => {
  try {
    const { mois } = req.query;
    const whereProgramme = {};
    if (mois) whereProgramme.date = { [Op.like]: `${mois}%` };

    const programmes = await Programme.findAll({ where: { ...whereProgramme, statut: 'Tenu' }, order: [['date', 'ASC']] });

    const tauxParProgramme = [];
    for (const prog of programmes) {
      const presents = await Presence.count({ where: { programme_id: prog.id, statut: 'Present' } });
      const absents = await Presence.count({ where: { programme_id: prog.id, statut: 'Absent' } });
      const total = presents + absents;
      tauxParProgramme.push({
        date: prog.date,
        type: prog.type,
        taux: total > 0 ? Math.round((presents / total) * 100) : 0,
        presents, absents
      });
    }

    const repartitionType = {};
    for (const prog of programmes) {
      if (!repartitionType[prog.type]) repartitionType[prog.type] = { presents: 0, absents: 0 };
      const presents = await Presence.count({ where: { programme_id: prog.id, statut: 'Present' } });
      const absents = await Presence.count({ where: { programme_id: prog.id, statut: 'Absent' } });
      repartitionType[prog.type].presents += presents;
      repartitionType[prog.type].absents += absents;
    }

    const membres = await Membre.findAll({ where: { statut: { [Op.ne]: 'Inactif' } } });
    const classement = [];
    for (const m of membres) {
      const presents = await Presence.count({ include: [{ model: Programme, where: whereProgramme, attributes: [] }], where: { membre_id: m.id, statut: 'Present' } });
      const total = await Presence.count({ include: [{ model: Programme, where: whereProgramme, attributes: [] }], where: { membre_id: m.id } });
      if (total > 0) {
        classement.push({ id: m.id, nom: `${m.prenom} ${m.nom}`, presents, total, taux: Math.round((presents / total) * 100) });
      }
    }
    classement.sort((a, b) => b.taux - a.taux || b.presents - a.presents);

    const hommesPresents = await Presence.count({
      include: [{ model: Membre, where: { sexe: 'H' }, attributes: [] }, { model: Programme, where: whereProgramme, attributes: [] }],
      where: { statut: 'Present' }
    });
    const hommesTotal = await Presence.count({
      include: [{ model: Membre, where: { sexe: 'H' }, attributes: [] }, { model: Programme, where: whereProgramme, attributes: [] }]
    });
    const femmesPresents = await Presence.count({
      include: [{ model: Membre, where: { sexe: 'F' }, attributes: [] }, { model: Programme, where: whereProgramme, attributes: [] }],
      where: { statut: 'Present' }
    });
    const femmesTotal = await Presence.count({
      include: [{ model: Membre, where: { sexe: 'F' }, attributes: [] }, { model: Programme, where: whereProgramme, attributes: [] }]
    });

    const evolutionNouveaux = [];
    const maintenant = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const moisStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = await Membre.count({ where: { date_adhesion: { [Op.like]: `${moisStr}%` } } });
      evolutionNouveaux.push({ mois: moisStr, count });
    }

    res.json({
      tauxParProgramme,
      repartitionType,
      classement: classement.slice(0, 10),
      comparaisonHF: {
        hommes: { presents: hommesPresents, total: hommesTotal, taux: hommesTotal > 0 ? Math.round((hommesPresents / hommesTotal) * 100) : 0 },
        femmes: { presents: femmesPresents, total: femmesTotal, taux: femmesTotal > 0 ? Math.round((femmesPresents / femmesTotal) * 100) : 0 }
      },
      evolutionNouveaux
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const genererRapportPDF = async (req, res) => {
  try {
    const { mois, type_programme, sexe, commission } = req.query;
    const { programmes, presences, nouveauxMembres } = await getDonneesRapport({ mois, type_programme, sexe, commission });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_dmwm_${mois || 'complet'}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).fillColor('#1B5E8A').text('DMWM — Conseil UASZ', { align: 'center' });
    doc.fontSize(12).fillColor('#333').text('Rapport mensuel de présences', { align: 'center' });
    doc.moveDown();
    doc.fontSize(9).fillColor('#888').text(`Période : ${mois || 'Toutes périodes'} — Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown(2);

    const totalPresents = presences.filter(p => p.statut === 'Present').length;
    const totalAbsents = presences.filter(p => p.statut === 'Absent').length;
    const tauxGlobal = presences.length > 0 ? Math.round((totalPresents / presences.length) * 100) : 0;

    doc.fontSize(13).fillColor('#1B5E8A').text('Résumé général', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Nombre de programmes : ${programmes.length}`);
    doc.text(`Total présences enregistrées : ${presences.length}`);
    doc.text(`Présents : ${totalPresents} | Absents : ${totalAbsents}`);
    doc.text(`Taux de présence global : ${tauxGlobal}%`);
    doc.text(`Nouveaux adhérents : ${nouveauxMembres.length}`);
    doc.moveDown(1.5);

    doc.fontSize(13).fillColor('#1B5E8A').text('Détail par programme', { underline: true });
    doc.moveDown(0.5);

    for (const prog of programmes) {
      const presProg = presences.filter(p => p.programme_id === prog.id);
      const presentsProg = presProg.filter(p => p.statut === 'Present').length;
      const totalProg = presProg.length;
      const tauxProg = totalProg > 0 ? Math.round((presentsProg / totalProg) * 100) : 0;

      doc.fontSize(10).fillColor('#333').text(
        `${new Date(prog.date).toLocaleDateString('fr-FR')} — ${prog.type} : ${presentsProg}/${totalProg} présents (${tauxProg}%)`
      );
    }

    doc.moveDown(1.5);

    const membresAbsents = presences.filter(p => p.statut === 'Absent');
    if (membresAbsents.length > 0) {
      doc.fontSize(13).fillColor('#dc3545').text('Liste des absences', { underline: true });
      doc.moveDown(0.5);
      const nomsUniques = [...new Set(membresAbsents.map(p => `${p.Membre?.prenom} ${p.Membre?.nom}`))];
      nomsUniques.slice(0, 30).forEach(nom => {
        doc.fontSize(9).fillColor('#333').text(`• ${nom}`);
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const genererRapportExcel = async (req, res) => {
  try {
    const { mois, type_programme, sexe, commission } = req.query;
    const { programmes, presences, nouveauxMembres } = await getDonneesRapport({ mois, type_programme, sexe, commission });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DMWM Conseil UASZ';

    const sheetResume = workbook.addWorksheet('Résumé');
    sheetResume.columns = [{ width: 30 }, { width: 20 }];
    sheetResume.addRow(['DMWM — Conseil UASZ']).font = { bold: true, size: 14 };
    sheetResume.addRow([`Rapport - ${mois || 'Toutes périodes'}`]);
    sheetResume.addRow([]);

    const totalPresents = presences.filter(p => p.statut === 'Present').length;
    const totalAbsents = presences.filter(p => p.statut === 'Absent').length;
    const tauxGlobal = presences.length > 0 ? Math.round((totalPresents / presences.length) * 100) : 0;

    sheetResume.addRow(['Indicateur', 'Valeur']).font = { bold: true };
    sheetResume.addRow(['Nombre de programmes', programmes.length]);
    sheetResume.addRow(['Total présences', presences.length]);
    sheetResume.addRow(['Présents', totalPresents]);
    sheetResume.addRow(['Absents', totalAbsents]);
    sheetResume.addRow(['Taux de présence global', `${tauxGlobal}%`]);
    sheetResume.addRow(['Nouveaux adhérents', nouveauxMembres.length]);

    const sheetDetail = workbook.addWorksheet('Détail présences');
    sheetDetail.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Programme', key: 'type', width: 20 },
      { header: 'Membre', key: 'membre', width: 25 },
      { header: 'Sexe', key: 'sexe', width: 10 },
      { header: 'Commission', key: 'commission', width: 15 },
      { header: 'Statut', key: 'statut', width: 12 }
    ];
    sheetDetail.getRow(1).font = { bold: true };
    sheetDetail.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E8A' } };

    presences.forEach(p => {
      sheetDetail.addRow({
        date: p.Programme?.date ? new Date(p.Programme.date).toLocaleDateString('fr-FR') : '',
        type: p.Programme?.type || '',
        membre: `${p.Membre?.prenom || ''} ${p.Membre?.nom || ''}`,
        sexe: p.Membre?.sexe || '',
        commission: p.Membre?.commission || '',
        statut: p.statut
      });
    });

    const sheetNouveaux = workbook.addWorksheet('Nouveaux adhérents');
    sheetNouveaux.columns = [
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Téléphone', key: 'telephone', width: 15 },
      { header: 'Catégorie', key: 'categorie', width: 20 },
      { header: 'Date adhésion', key: 'date_adhesion', width: 15 }
    ];
    sheetNouveaux.getRow(1).font = { bold: true };
    sheetNouveaux.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E8A' } };

    nouveauxMembres.forEach(m => {
      sheetNouveaux.addRow({
        prenom: m.prenom, nom: m.nom, telephone: m.telephone || '',
        categorie: m.categorie, date_adhesion: m.date_adhesion ? new Date(m.date_adhesion).toLocaleDateString('fr-FR') : ''
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_dmwm_${mois || 'complet'}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = { statistiquesVisuelles, genererRapportPDF, genererRapportExcel };