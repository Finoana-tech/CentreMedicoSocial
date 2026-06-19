const OrdonnanceModel = require('../models/ordonnanceModel');
const LigneOrdonnanceModel = require('../models/ligneOrdonnanceModel');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');


class OrdonnanceController {
  async create(req, res) {
    try {
      const { id_patient, id_medecin, date_prescription } = req.body;
      if (!id_patient || !id_medecin || !date_prescription) {
        return res.status(400).json({
          success: false,
          message: 'Les champs id_patient, id_medecin et date_prescription sont obligatoires'
        });
      }

      const newOrdonnance = await OrdonnanceModel.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Ordonnance créée avec succès',
        data: newOrdonnance
      });

    } catch (err) {
      console.error('Erreur création ordonnance:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const ordonnances = await OrdonnanceModel.getAll();
      res.json({
        success: true,
        message: 'Ordonnances récupérées avec succès',
        data: ordonnances,
        count: ordonnances.length
      });
    } catch (err) {
      console.error('Erreur récupération ordonnances:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const ordonnance = await OrdonnanceModel.getById(id);
      if (!ordonnance) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      res.json({
        success: true,
        message: 'Ordonnance récupérée avec succès',
        data: ordonnance
      });
    } catch (err) {
      console.error('Erreur getById:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async getForEdit(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const ordonnance = await OrdonnanceModel.getById(id);
      if (!ordonnance) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      const medicaments = await LigneOrdonnanceModel.getByOrdonnanceId(id);

      res.json({
        success: true,
        message: 'Ordonnance prête pour édition',
        data: { ...ordonnance, medicaments }
      });

    } catch (err) {
      console.error('Erreur getForEdit:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { id_patient, id_medecin, date_prescription } = req.body;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });
      if (!id_patient || !id_medecin || !date_prescription) return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });

      const updatedOrdonnance = await OrdonnanceModel.update(id, req.body);
      if (!updatedOrdonnance) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      res.json({ success: true, message: 'Ordonnance mise à jour avec succès', data: updatedOrdonnance });
    } catch (err) {
      console.error('Erreur update:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const deleted = await OrdonnanceModel.delete(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      res.json({ success: true, message: 'Ordonnance supprimée avec succès' });
    } catch (err) {
      console.error('Erreur delete:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

 
  async search(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 2) return res.status(400).json({ success: false, message: 'Recherche minimale 2 caractères' });

      const ordonnances = await OrdonnanceModel.search(q.trim());
      res.json({ success: true, message: 'Recherche effectuée', data: ordonnances, count: ordonnances.length });
    } catch (err) {
      console.error('Erreur search:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async valider(req, res) {
    try {
      const id = req.params.id;
      const { validated_by } = req.body;
      if (!id || isNaN(id) || !validated_by) return res.status(400).json({ success: false, message: 'ID et validateur obligatoires' });

      const validee = await OrdonnanceModel.valider(id, validated_by);
      if (!validee) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      res.json({ success: true, message: 'Ordonnance validée', data: { id_ordonnance: id, statut: 'Validée' } });
    } catch (err) {
      console.error('Erreur valider:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async marquerEnPreparation(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const miseAJour = await OrdonnanceModel.marquerEnPreparation(id);
      if (!miseAJour) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      res.json({ success: true, message: 'Ordonnance en préparation', data: { id_ordonnance: id, statut: 'En préparation' } });
    } catch (err) {
      console.error('Erreur marquerEnPreparation:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async delivrer(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const delivree = await OrdonnanceModel.delivrer(id);
      if (!delivree) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      res.json({ success: true, message: 'Ordonnance délivrée', data: { id_ordonnance: id, statut: 'Délivrée' } });
    } catch (err) {
      console.error('Erreur delivrer:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async annuler(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const annulee = await OrdonnanceModel.annuler(id);
      if (!annulee) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      res.json({ success: true, message: 'Ordonnance annulée', data: { id_ordonnance: id, statut: 'Annulée' } });
    } catch (err) {
      console.error('Erreur annuler:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async utiliserRenouvellement(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const renouvele = await OrdonnanceModel.utiliserRenouvellement(id);
      if (!renouvele) return res.status(400).json({ success: false, message: 'Renouvellement impossible' });

      res.json({ success: true, message: 'Renouvellement utilisé', data: { id_ordonnance: id } });
    } catch (err) {
      console.error('Erreur utiliserRenouvellement:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async getRenouvellementsRestants(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const renouvellementsRestants = await OrdonnanceModel.getRenouvellementsRestants(id);
      res.json({ success: true, message: 'Renouvellements restants', data: { id_ordonnance: id, renouvellements_restants: renouvellementsRestants } });
    } catch (err) {
      console.error('Erreur getRenouvellementsRestants:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async renouvelerOrdonnance(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const nouvelleOrdonnanceId = await OrdonnanceModel.renouvelerOrdonnance(id);
      res.status(201).json({ success: true, message: 'Ordonnance renouvelée', data: { id_ordonnance_original: id, id_ordonnance_nouvelle: nouvelleOrdonnanceId } });
    } catch (err) {
      console.error('Erreur renouvelerOrdonnance:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async getStatsByStatut(req, res) {
    try {
      const stats = await OrdonnanceModel.getStatsByStatut();
      res.json({ success: true, message: 'Stats par statut', data: stats });
    } catch (err) {
      console.error('Erreur getStatsByStatut:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async getOrdonnancesUrgentes(req, res) {
    try {
      const urgentes = await OrdonnanceModel.getOrdonnancesUrgentes();
      res.json({ success: true, message: 'Ordonnances urgentes', data: urgentes, count: urgentes.length });
    } catch (err) {
      console.error('Erreur getOrdonnancesUrgentes:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async getRecentPrescriptions(req, res) {
    try {
      const recents = await OrdonnanceModel.getRecentPrescriptions();
      res.json({ success: true, message: 'Ordonnances récentes', data: recents, count: recents.length });
    } catch (err) {
      console.error('Erreur getRecentPrescriptions:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async countOrdonnancesThisMonth(req, res) {
    try {
      const count = await OrdonnanceModel.countOrdonnancesThisMonth();
      res.json({ success: true, message: 'Nombre d\'ordonnances ce mois', data: { count } });
    } catch (err) {
      console.error('Erreur countOrdonnancesThisMonth:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async estValide(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const infoValidite = await OrdonnanceModel.estValide(id);
      if (!infoValidite) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      res.json({ success: true, message: infoValidite.est_valide ? 'Valide' : 'Non valide', data: infoValidite });
    } catch (err) {
      console.error('Erreur estValide:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

  async getDetailsById(req, res) {
    try {
      const id = req.params.id;
      if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID invalide' });

      const ordonnance = await OrdonnanceModel.getById(id);
      if (!ordonnance) return res.status(404).json({ success: false, message: 'Ordonnance non trouvée' });

      const medicaments = await LigneOrdonnanceModel.getByOrdonnanceId(id);
      
      res.json({
        success: true,
        message: 'Détails de l\'ordonnance récupérés avec succès',
        data: {
          ...ordonnance,
          medicaments: medicaments
        }
      });
    } catch (err) {
      console.error('Erreur getDetailsById:', err);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: err.message });
    }
  }

async exportToPDF(req, res) {
  try {
    const id = req.params.id;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID invalide' 
      });
    }

    const ordonnance = await OrdonnanceModel.getById(id);
    if (!ordonnance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ordonnance non trouvée' 
      });
    }
    
    const medicaments = await LigneOrdonnanceModel.getByOrdonnanceId(id);

    const ordonnanceData = {
      ...ordonnance,
      medicaments: medicaments || []
    };

    const doc = new jsPDF();
    doc.setFont('helvetica');
    
    // Fonction pour normaliser le texte
    const normaliserTexte = (texte) => {
      if (!texte) return '';
      return String(texte)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^\x00-\x7F]/g, ''); 
    };

    const afficherTexte = (texte, x, y, options = {}) => {
      const texteNormalise = normaliserTexte(texte);
      doc.text(texteNormalise, x, y, options);
    };

    const diviserTexte = (texte, largeur) => {
      const texteNormalise = normaliserTexte(texte);
      return doc.splitTextToSize(texteNormalise, largeur);
    };

    // Variables de position
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;

    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    afficherTexte('CENTRE MEDICO-SOCIAL - JIRAMA', pageWidth / 2, yPosition, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;
    afficherTexte('ORDONNANCE MÉDICALE', pageWidth / 2, yPosition, { align: 'center' });
    
    // Ligne de séparation
    yPosition += 10;
    doc.setLineWidth(0.5);
    doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    afficherTexte('INFORMATIONS ORDONNANCE', marginLeft, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 7;
    
    afficherTexte(`N°: JIRAMA-ORD-${ordonnanceData.id_ordonnance || id}`, marginLeft, yPosition);
    afficherTexte(`Date: ${new Date(ordonnanceData.date_prescription || new Date()).toLocaleDateString('fr-FR')}`, pageWidth - 60, yPosition);
    yPosition += 7;
    
    const statut = ordonnanceData.statut || 'En attente';
    doc.setFont('helvetica', 'bold');
    afficherTexte(`Statut: ${statut}`, marginLeft, yPosition);
    doc.setFont('helvetica', 'normal');
    
    if (ordonnanceData.urgence) {
      afficherTexte('🟥 URGENT', pageWidth - 60, yPosition);
    }
    yPosition += 15;

    //Informations du patient
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    afficherTexte('INFORMATIONS PATIENT', marginLeft, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 7;
    
    const patientNom = ordonnanceData.patient?.nom || ordonnanceData.patient_nom || '';
    const patientPrenom = ordonnanceData.patient?.prenom || ordonnanceData.patient_prenom || '';
    afficherTexte(`Nom complet: ${patientNom} ${patientPrenom}`, marginLeft, yPosition);
    yPosition += 6;
    
    if (ordonnanceData.patient?.date_naissance) {
      const dateNaissance = new Date(ordonnanceData.patient.date_naissance);
      const age = Math.floor((new Date() - dateNaissance) / (365.25 * 24 * 60 * 60 * 1000));
      afficherTexte(`Date naissance: ${dateNaissance.toLocaleDateString('fr-FR')} (${age} ans)`, marginLeft, yPosition);
      yPosition += 6;
    }
    yPosition += 10;

    // Information medécin
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    afficherTexte('MÉDECIN PRESCRIPTEUR', marginLeft, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 7;
    
    const medecinNom = ordonnanceData.medecin?.nom || ordonnanceData.medecin_nom || '';
    const medecinPrenom = ordonnanceData.medecin?.prenom || ordonnanceData.medecin_prenom || '';
    afficherTexte(`Dr. ${medecinNom} ${medecinPrenom}`, marginLeft, yPosition);
    yPosition += 6;
    
    if (ordonnanceData.medecin?.specialite) {
      afficherTexte(`Spécialité: ${ordonnanceData.medecin.specialite}`, marginLeft, yPosition);
      yPosition += 6;
    }
    
    if (ordonnanceData.medecin?.rpps) {
      afficherTexte(`RPPS: ${ordonnanceData.medecin.rpps}`, marginLeft, yPosition);
      yPosition += 6;
    }
    yPosition += 10;

    if (ordonnanceData.diagnostic) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      afficherTexte('DIAGNOSTIC', marginLeft, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 7;
      
      const splitDiagnostic = diviserTexte(ordonnanceData.diagnostic, contentWidth);
      doc.text(splitDiagnostic, marginLeft, yPosition);
      yPosition += (splitDiagnostic.length * 5) + 10;
    }

    if (ordonnanceData.instructions) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      afficherTexte('INSTRUCTIONS MÉDICALES', marginLeft, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 7;
      
      const splitInstructions = diviserTexte(ordonnanceData.instructions, contentWidth);
      doc.text(splitInstructions, marginLeft, yPosition);
      yPosition += (splitInstructions.length * 5) + 10;
    }

    if (ordonnanceData.medicaments && ordonnanceData.medicaments.length > 0) {
      console.log('📝 Ajout médicaments...');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      afficherTexte('MÉDICAMENTS PRESCRITS', marginLeft, yPosition);
      yPosition += 10;
      
      const tableData = ordonnanceData.medicaments.map((med, index) => {
        return [
          String(index + 1),
          normaliserTexte(med.nom_commercial || med.medicament_nom || 'Médicament'),
          normaliserTexte(med.principe_actif || '-'),
          normaliserTexte(med.dosage || med.medicament_dosage || '-'),
          normaliserTexte(med.forme || med.medicament_forme || '-'),
          normaliserTexte(med.voie_administration || 'Orale'),
          String(med.quantite_prescrite || med.quantite || 1),
          String(med.quantite_delivree || 0),
          normaliserTexte(med.posologie || 'Selon prescription'),
          `${med.duree_traitement || med.duree || 7} jours`
        ];
      });
      
      
      try {
        doc.autoTable({
          startY: yPosition,
          head: [['N°', 'Médicament', 'Principe Actif', 'Dosage', 'Forme', 'Voie', 'Qté Presc.', 'Qté Déliv.', 'Posologie', 'Durée']],
          body: tableData,
          theme: 'grid',
          styles: { 
            fontSize: 8,
            cellPadding: 2,
            font: 'helvetica',
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          headStyles: { 
            fillColor: [0, 51, 102], // Bleu JIRAMA
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center'
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' }, // N°
            1: { cellWidth: 35, halign: 'left' },   // Médicament
            2: { cellWidth: 25, halign: 'left' },   // Principe Actif
            3: { cellWidth: 20, halign: 'center' }, // Dosage
            4: { cellWidth: 20, halign: 'center' }, // Forme
            5: { cellWidth: 15, halign: 'center' }, // Voie
            6: { cellWidth: 15, halign: 'center' }, // Qté Presc.
            7: { cellWidth: 15, halign: 'center' }, // Qté Déliv.
            8: { cellWidth: 30, halign: 'left' },   // Posologie
            9: { cellWidth: 15, halign: 'center' }  // Durée
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { left: marginLeft, right: marginRight },
          tableWidth: 'auto',
          didParseCell: function (data) {
            if (data.row.index > 0 && (data.column.index === 1 || data.column.index === 8)) {
              data.cell.styles.cellPadding = { top: 2, right: 1, bottom: 2, left: 1 };
            }
          }
        });
        
        yPosition = doc.lastAutoTable.finalY + 10;
      } catch (tableError) {
        console.error(' Erreur génération tableau:', tableError);
        doc.setFontSize(10);
        ordonnanceData.medicaments.forEach((med, index) => {
          const medText = `${index + 1}. ${med.nom_commercial || med.nom} - ${med.dosage || ''} - ${med.posologie || ''}`;
          afficherTexte(medText, marginLeft, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }
    } else {
      doc.setFontSize(12);
      afficherTexte('Aucun médicament prescrit', marginLeft, yPosition);
      yPosition += 20;
    }
   
    if (ordonnanceData.notes) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      afficherTexte('OBSERVATIONS', marginLeft, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 7;
      
      const splitNotes = diviserTexte(ordonnanceData.notes, contentWidth);
      doc.text(splitNotes, marginLeft, yPosition);
      yPosition += (splitNotes.length * 5) + 10;
    }

    if (ordonnanceData.renouvelable) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      afficherTexte('INFORMATIONS RENOUVELLEMENT', marginLeft, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 7;
      
      afficherTexte(`Renouvelable: OUI`, marginLeft, yPosition);
      yPosition += 6;
      
      const renouvellementsEffectues = ordonnanceData.nb_renouvellements_effectues || 0;
      const renouvellementsAutorises = ordonnanceData.nb_renouvellements_autorises || 0;
      afficherTexte(`Renouvellements: ${renouvellementsEffectues}/${renouvellementsAutorises}`, marginLeft, yPosition);
      yPosition += 6;
      
      if (renouvellementsAutorises > renouvellementsEffectues) {
        const restants = renouvellementsAutorises - renouvellementsEffectues;
        afficherTexte(`Renouvellements restants: ${restants}`, marginLeft, yPosition);
        yPosition += 6;
      }
      
      if (ordonnanceData.duree_validite) {
        afficherTexte(`Durée de validité: ${ordonnanceData.duree_validite} jours`, marginLeft, yPosition);
        yPosition += 6;
      }
      yPosition += 10;
    }

    console.log(' Ajout signature...');
    const signatureY = Math.max(yPosition, doc.internal.pageSize.getHeight() - 40);
    doc.setLineWidth(0.5);
    doc.line(marginLeft + 80, signatureY, marginLeft + 160, signatureY);
    
    doc.setFontSize(12);
    afficherTexte('Signature et cachet du médecin', marginLeft, signatureY - 10);
    afficherTexte(`Dr. ${medecinNom} ${medecinPrenom}`, marginLeft + 80, signatureY + 5);
    afficherTexte(`Fait à Antsirabe, le ${new Date().toLocaleDateString('fr-FR')}`, marginLeft, signatureY + 15);
   
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    afficherTexte(
      `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} - JIRAMA Centre Medico-Social`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
  
    const pdfBuffer = doc.output('arraybuffer');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ordonnance-JIRAMA-${ordonnanceData.id_ordonnance || id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.byteLength);
    
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error(' Erreur exportToPDF:', error);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du PDF', 
      error: error.message
    });
  }
}
}

module.exports = new OrdonnanceController();