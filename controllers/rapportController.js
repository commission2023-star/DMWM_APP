const { Membre, Programme, Presence } = require('../models');
const { Op } = require('sequelize');
const { conditionMois } = require('../utils/mois');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const getDonneesRapport = async (filtres) => {
  const { mois, type_programme, sexe, commission } = filtres;

  const whereProgramme = {};
  if (conditionMois(mois)) whereProgramme.date = conditionMois(mois);
  if (type_programme) whereProgramme.type = type_programme;

  const programmes = await Programme.findAll({ where: whereProgramme, order: [['date', 'ASC']] });
  const programmeIds = programmes.map(p => p.id);

  const presences = programmeIds.length === 0 ? [] : await Presence.findAll({
    where: { programme_id: { [Op.in]: programmeIds } },
    include: [
      { model: Membre, attributes: ['id', 'prenom', 'nom', 'sexe', 'commission'] },
      { model: Programme, attributes: ['id', 'type', 'date'] }
    ]
  });

  let presencesFiltrees = presences;
  if (sexe) presencesFiltrees = presencesFiltrees.filter(p => p.Membre?.sexe === sexe);
  if (commission) presencesFiltrees = presencesFiltrees.filter(p => p.Membre?.commission === commission);

  const whereMembre = { statut: 'Nouveau' };
  if (conditionMois(mois)) whereMembre.date_adhesion = conditionMois(mois);
  const nouveauxMembres = await Membre.findAll({ where: whereMembre });

  return { programmes, presences: presencesFiltrees, nouveauxMembres };
};

const statistiquesVisuelles = async (req, res) => {
  try {
    const { mois } = req.query;
    const whereProgramme = {};
    if (conditionMois(mois)) whereProgramme.date = conditionMois(mois);

    const programmes = await Programme.findAll({ where: { ...whereProgramme, statut: 'Tenu' }, order: [['date', 'ASC']] });

    const tauxParProgramme = [];
    const repartitionType = {};
    for (const prog of programmes) {
      const presents = await Presence.count({ where: { programme_id: prog.id, statut: 'Present' } });
      const absents = await Presence.count({ where: { programme_id: prog.id, statut: 'Absent' } });
      const total = presents + absents;
      tauxParProgramme.push({ date: prog.date, type: prog.type, taux: total > 0 ? Math.round((presents / total) * 100) : 0, presents, absents });
      if (!repartitionType[prog.type]) repartitionType[prog.type] = { presents: 0, absents: 0 };
      repartitionType[prog.type].presents += presents;
      repartitionType[prog.type].absents += absents;
    }

    const programmeIds = programmes.map(p => p.id);
    const membres = await Membre.findAll({ where: { statut: { [Op.ne]: 'Inactif' } } });
    const classement = [];
    if (programmeIds.length > 0) {
      for (const m of membres) {
        const presents = await Presence.count({ where: { membre_id: m.id, statut: 'Present', programme_id: { [Op.in]: programmeIds } } });
        const total = await Presence.count({ where: { membre_id: m.id, programme_id: { [Op.in]: programmeIds } } });
        if (total > 0) classement.push({ id: m.id, nom: `${m.prenom} ${m.nom}`, presents, total, taux: Math.round((presents / total) * 100) });
      }
    }
    classement.sort((a, b) => b.taux - a.taux || b.presents - a.presents);

    const compterHF = async (sexe) => {
      if (programmeIds.length === 0) return { presents: 0, total: 0, taux: 0 };
      const ids = (await Membre.findAll({ where: { sexe }, attributes: ['id'] })).map(m => m.id);
      if (ids.length === 0) return { presents: 0, total: 0, taux: 0 };
      const base = { membre_id: { [Op.in]: ids }, programme_id: { [Op.in]: programmeIds } };
      const presents = await Presence.count({ where: { ...base, statut: 'Present' } });
      const total = await Presence.count({ where: base });
      return { presents, total, taux: total > 0 ? Math.round((presents / total) * 100) : 0 };
    };

    const evolutionNouveaux = [];
    const maintenant = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const moisStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = await Membre.count({ where: { date_adhesion: conditionMois(moisStr) } });
      evolutionNouveaux.push({ mois: moisStr, count });
    }

    res.json({
      tauxParProgramme,
      repartitionType,
      classement: classement.slice(0, 10),
      comparaisonHF: { hommes: await compterHF('H'), femmes: await compterHF('F') },
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

    doc.fontSize(18).fillColor('#1B5E8A').text('DMWM - Conseil UASZ', { align: 'center' });
    doc.fontSize(12).fillColor('#333').text('Rapport de presences', { align: 'center' });
    doc.moveDown();
    doc.fontSize(9).fillColor('#888').text(`Periode : ${mois || 'Toutes periodes'} - Genere le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown(2);

    const totalPresents = presences.filter(p => p.statut === 'Present').length;
    const totalAbsents = presences.filter(p => p.statut === 'Absent').length;
    const tauxGlobal = presences.length > 0 ? Math.round((totalPresents / presences.length) * 100) : 0;

    doc.fontSize(13).fillColor('#1B5E8A').text('Resume general', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Nombre de programmes : ${programmes.length}`);
    doc.text(`Total presences enregistrees : ${presences.length}`);
    doc.text(`Presents : ${totalPresents} | Absents : ${totalAbsents}`);
    doc.text(`Taux de presence global : ${tauxGlobal}%`);
    doc.text(`Nouveaux adherents : ${nouveauxMembres.length}`);
    doc.moveDown(1.5);

    doc.fontSize(13).fillColor('#1B5E8A').text('Detail par programme', { underline: true });
    doc.moveDown(0.5);
    for (const prog of programmes) {
      const presProg = presences.filter(p => p.programme_id === prog.id);
      const presentsProg = presProg.filter(p => p.statut === 'Present').length;
      const tauxProg = presProg.length > 0 ? Math.round((presentsProg / presProg.length) * 100) : 0;
      doc.fontSize(10).fillColor('#333').text(`${new Date(prog.date).toLocaleDateString('fr-FR')} - ${prog.type} : ${presentsProg}/${presProg.length} presents (${tauxProg}%)`);
    }
    doc.moveDown(1.5);

    const absences = presences.filter(p => p.statut === 'Absent');
    if (absences.length > 0) {
      doc.fontSize(13).fillColor('#dc3545').text('Liste des absences', { underline: true });
      doc.moveDown(0.5);
      [...new Set(absences.map(p => `${p.Membre?.prenom} ${p.Membre?.nom}`))].slice(0, 30).forEach(nom => {
        doc.fontSize(9).fillColor('#333').text(`- ${nom}`);
      });
    }
    doc.end();
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

const genererRapportExcel = async (req, res) => {
  try {
    const { mois, type_programme, sexe, commission } = req.query;
    const { programmes, presences, nouveauxMembres } = await getDonneesRapport({ mois, type_programme, sexe, commission });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DMWM Conseil UASZ';

    const sheetResume = workbook.addWorksheet('Resume');
    sheetResume.columns = [{ width: 30 }, { width: 20 }];
    sheetResume.addRow(['DMWM - Conseil UASZ']).font = { bold: true, size: 14 };
    sheetResume.addRow([`Rapport - ${mois || 'Toutes periodes'}`]);
    sheetResume.addRow([]);
    const totalPresents = presences.filter(p => p.statut === 'Present').length;
    const totalAbsents = presences.filter(p => p.statut === 'Absent').length;
    const tauxGlobal = presences.length > 0 ? Math.round((totalPresents / presences.length) * 100) : 0;
    sheetResume.addRow(['Indicateur', 'Valeur']).font = { bold: true };
    sheetResume.addRow(['Nombre de programmes', programmes.length]);
    sheetResume.addRow(['Total presences', presences.length]);
    sheetResume.addRow(['Presents', totalPresents]);
    sheetResume.addRow(['Absents', totalAbsents]);
    sheetResume.addRow(['Taux de presence global', `${tauxGlobal}%`]);
    sheetResume.addRow(['Nouveaux adherents', nouveauxMembres.length]);

    const sheetDetail = workbook.addWorksheet('Detail presences');
    sheetDetail.columns = [
      { header: 'Date', key: 'date', width: 15 }, { header: 'Programme', key: 'type', width: 20 },
      { header: 'Membre', key: 'membre', width: 25 }, { header: 'Sexe', key: 'sexe', width: 10 },
      { header: 'Commission', key: 'commission', width: 15 }, { header: 'Statut', key: 'statut', width: 12 }
    ];
    sheetDetail.getRow(1).font = { bold: true };
    presences.forEach(p => sheetDetail.addRow({
      date: p.Programme?.date ? new Date(p.Programme.date).toLocaleDateString('fr-FR') : '',
      type: p.Programme?.type || '',
      membre: `${p.Membre?.prenom || ''} ${p.Membre?.nom || ''}`,
      sexe: p.Membre?.sexe || '', commission: p.Membre?.commission || '', statut: p.statut
    }));

    const sheetNouveaux = workbook.addWorksheet('Nouveaux adherents');
    sheetNouveaux.columns = [
      { header: 'Prenom', key: 'prenom', width: 20 }, { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Telephone', key: 'telephone', width: 15 }, { header: 'Categorie', key: 'categorie', width: 20 },
      { header: 'Date adhesion', key: 'date_adhesion', width: 15 }
    ];
    sheetNouveaux.getRow(1).font = { bold: true };
    nouveauxMembres.forEach(m => sheetNouveaux.addRow({
      prenom: m.prenom, nom: m.nom, telephone: m.telephone || '', categorie: m.categorie,
      date_adhesion: m.date_adhesion ? new Date(m.date_adhesion).toLocaleDateString('fr-FR') : ''
    }));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rapport_dmwm_${mois || 'complet'}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Erreur serveur.', erreur: error.message });
  }
};

module.exports = { statistiquesVisuelles, genererRapportPDF, genererRapportExcel };
