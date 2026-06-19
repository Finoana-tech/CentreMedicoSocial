const db = require('../config/db');

const OrdonnanceModel = {
  getAll: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          o.id_ordonnance,
          o.date_prescription,
          o.instructions,
          o.statut,
          o.diagnostic,
          o.renouvelable,
          o.nb_renouvellements_autorises,
          o.nb_renouvellements_effectues,
          o.duree_validite,
          o.urgence,
          o.date_validation,
          o.date_delivrance,
          o.created_at,
          p.nom AS patient_nom,
          p.prenom AS patient_prenom,
          m.nom AS medecin_nom,
          m.prenom AS medecin_prenom,
          o.id_rendez_vous,
          GROUP_CONCAT(DISTINCT med.nom_commercial SEPARATOR ', ') AS medicaments
        FROM ordonnance o
        JOIN patient p ON o.id_patient = p.id_patient
        JOIN medecin m ON o.id_medecin = m.id_medecin
        LEFT JOIN ligne_ordonnance lo ON lo.id_ordonnance = o.id_ordonnance
        LEFT JOIN medicament med ON lo.id_medicament = med.id_medicament
        GROUP BY o.id_ordonnance
        ORDER BY o.date_prescription DESC
      `);
      return rows;
    } catch (error) {
      console.error('OrdonnanceModel.getAll - Erreur:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [ord] = await db.execute(
        `SELECT 
           o.*, 
           p.nom AS patient_nom, p.prenom AS patient_prenom,
           m.nom AS medecin_nom, m.prenom AS medecin_prenom
         FROM ordonnance o
         JOIN patient p ON o.id_patient = p.id_patient
         JOIN medecin m ON o.id_medecin = m.id_medecin
         WHERE o.id_ordonnance = ?`,
        [id]
      );
      if (!ord.length) return null;
      const ordonnance = ord[0];

      const [lignes] = await db.execute(`
        SELECT 
          lo.id_ligne,
          lo.quantite_prescrite,
          lo.quantite_delivree,
          lo.posologie,
          lo.duree_traitement,
          lo.voie_administration,
          lo.statut as ligne_statut,
          lo.notes as ligne_notes,
          lo.prix_unitaire,
          med.id_medicament,
          med.nom_commercial, 
          med.principe_actif, 
          med.dosage,
          med.classe_therapeutique,
          med.prescription_restreinte
        FROM ligne_ordonnance lo
        JOIN medicament med ON lo.id_medicament = med.id_medicament
        WHERE lo.id_ordonnance = ?
      `, [id]);

      return {
        ...ordonnance,
        medicaments: lignes.map(ligne => ({
          id_ligne: ligne.id_ligne,
          id_medicament: ligne.id_medicament,
          nom_commercial: ligne.nom_commercial,
          principe_actif: ligne.principe_actif,
          dosage: ligne.dosage,
          classe_therapeutique: ligne.classe_therapeutique,
          quantite_prescrite: ligne.quantite_prescrite,
          quantite_delivree: ligne.quantite_delivree,
          posologie: ligne.posologie,
          duree_traitement: ligne.duree_traitement,
          voie_administration: ligne.voie_administration,
          statut: ligne.ligne_statut,
          notes: ligne.ligne_notes,
          prix_unitaire: ligne.prix_unitaire,
          prescription_restreinte: ligne.prescription_restreinte
        })),
        lignes: lignes || []
      };
    } catch (error) {
      console.error('OrdonnanceModel.getById - Erreur:', error);
      throw error;
    }
  },

  getDetailsById: async (id) => {
    try {
      const [results] = await db.execute(`
        SELECT 
          o.*,
          p.nom AS patient_nom, p.prenom AS patient_prenom, p.date_naissance,
          m.nom AS medecin_nom, m.prenom AS medecin_prenom, m.specialite,
          lo.id_ligne,
          lo.quantite_prescrite,
          lo.quantite_delivree,
          lo.posologie,
          lo.duree_traitement,
          lo.voie_administration,
          lo.statut as ligne_statut,
          lo.notes as ligne_notes,
          lo.prix_unitaire,
          med.id_medicament,
          med.nom_commercial, 
          med.principe_actif, 
          med.dosage,
          med.classe_therapeutique,
          med.prescription_restreinte
        FROM ordonnance o
        JOIN patient p ON o.id_patient = p.id_patient
        JOIN medecin m ON o.id_medecin = m.id_medecin
        LEFT JOIN ligne_ordonnance lo ON o.id_ordonnance = lo.id_ordonnance
        LEFT JOIN medicament med ON lo.id_medicament = med.id_medicament
        WHERE o.id_ordonnance = ?
      `, [id]);

      if (results.length === 0) return null;

      // Structuration pour l'affichage détaillé
      const ordonnance = {
        ...results[0],
        patient: {
          id_patient: results[0].id_patient,
          nom: results[0].patient_nom,
          prenom: results[0].patient_prenom,
          date_naissance: results[0].date_naissance
        },
        medecin: {
          id_medecin: results[0].id_medecin,
          nom: results[0].medecin_nom,
          prenom: results[0].medecin_prenom,
          specialite: results[0].specialite
        },
        medicaments: results
          .filter(row => row.id_medicament !== null)
          .map(row => ({
            id_ligne: row.id_ligne,
            id_medicament: row.id_medicament,
            nom_commercial: row.nom_commercial,
            principe_actif: row.principe_actif,
            dosage: row.dosage,
            classe_therapeutique: row.classe_therapeutique,
            quantite_prescrite: row.quantite_prescrite,
            quantite_delivree: row.quantite_delivree,
            posologie: row.posologie,
            duree_traitement: row.duree_traitement,
            voie_administration: row.voie_administration,
            statut: row.ligne_statut,
            notes: row.ligne_notes,
            prix_unitaire: row.prix_unitaire
          }))
      };

      return ordonnance;
    } catch (error) {
      console.error('OrdonnanceModel.getDetailsById - Erreur:', error);
      throw error;
    }
  },

  create: async (data) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { 
        id_patient, id_medecin, date_prescription, instructions, id_rendez_vous,
        statut, diagnostic, renouvelable, nb_renouvellements_autorises, duree_validite,
        urgence, notes, created_by, medicaments 
      } = data;

      const [result] = await connection.execute(
        `INSERT INTO ordonnance (
          id_patient, id_medecin, date_prescription, instructions, id_rendez_vous,
          statut, diagnostic, renouvelable, nb_renouvellements_autorises, duree_validite,
          urgence, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_patient, id_medecin, date_prescription, instructions, id_rendez_vous || null,
          statut || 'Brouillon', diagnostic, renouvelable || false, nb_renouvellements_autorises || 0, 
          duree_validite || 30, urgence || false, notes, created_by
        ]
      );

      const id_ordonnance = result.insertId;

      if (Array.isArray(medicaments) && medicaments.length > 0) {
        for (let medicament of medicaments) {
          await connection.execute(
            `INSERT INTO ligne_ordonnance (
              id_ordonnance, id_medicament, quantite_prescrite, posologie, 
              duree_traitement, voie_administration, statut, prix_unitaire
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id_ordonnance,
              medicament.id_medicament,
              medicament.quantite_prescrite || 1,
              medicament.posologie || '',
              medicament.duree_traitement || 7,
              medicament.voie_administration || 'Orale',
              medicament.statut || 'prescrit',
              medicament.prix_unitaire || 0.00
            ]
          );
        }
      }

      await connection.commit();
      return { id_ordonnance, ...data };
    } catch (error) {
      await connection.rollback();
      console.error('OrdonnanceModel.create - Erreur:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  update: async (id, data) => {
    try {
      const { 
        id_patient, id_medecin, date_prescription, instructions, id_rendez_vous,
        statut, diagnostic, renouvelable, nb_renouvellements_autorises, duree_validite,
        urgence, notes 
      } = data;

      const [result] = await db.execute(
        `UPDATE ordonnance
         SET id_patient=?, id_medecin=?, date_prescription=?, instructions=?, id_rendez_vous=?,
             statut=?, diagnostic=?, renouvelable=?, nb_renouvellements_autorises=?, duree_validite=?,
             urgence=?, notes=?, updated_at=NOW()
         WHERE id_ordonnance=?`,
        [
          id_patient, id_medecin, date_prescription, instructions, id_rendez_vous || null,
          statut, diagnostic, renouvelable, nb_renouvellements_autorises, duree_validite,
          urgence, notes, id
        ]
      );
      return result.affectedRows > 0 ? { id_ordonnance: id, ...data } : null;
    } catch (error) {
      console.error('OrdonnanceModel.update - Erreur:', error);
      throw error;
    }
  },

  delete: async (id) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(`DELETE FROM ligne_ordonnance WHERE id_ordonnance=?`, [id]);
      const [result] = await connection.execute(`DELETE FROM ordonnance WHERE id_ordonnance=?`, [id]);
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('OrdonnanceModel.delete - Erreur:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  search: async (query) => {
    try {
      const q = `%${query}%`;
      const [rows] = await db.execute(`
        SELECT 
          o.id_ordonnance,
          o.date_prescription,
          o.instructions,
          o.statut,
          o.diagnostic,
          o.urgence,
          p.nom AS patient_nom,
          p.prenom AS patient_prenom,
          m.nom AS medecin_nom,
          m.prenom AS medecin_prenom,
          GROUP_CONCAT(DISTINCT med.nom_commercial SEPARATOR ', ') AS medicaments
        FROM ordonnance o
        JOIN patient p ON o.id_patient = p.id_patient
        JOIN medecin m ON o.id_medecin = m.id_medecin
        LEFT JOIN ligne_ordonnance lo ON lo.id_ordonnance = o.id_ordonnance
        LEFT JOIN medicament med ON lo.id_medicament = med.id_medicament
        WHERE 
          p.nom LIKE ? OR p.prenom LIKE ? 
          OR m.nom LIKE ? OR m.prenom LIKE ? 
          OR o.date_prescription LIKE ?
          OR med.nom_commercial LIKE ?
          OR o.diagnostic LIKE ?
          OR o.statut LIKE ?
        GROUP BY o.id_ordonnance
        ORDER BY o.date_prescription DESC
      `, [q, q, q, q, q, q, q, q]);
      return rows;
    } catch (error) {
      console.error('OrdonnanceModel.search - Erreur:', error);
      throw error;
    }
  },

  valider: async (id_ordonnance, validated_by) => {
    try {
      const [result] = await db.execute(
        `UPDATE ordonnance 
         SET statut = 'Validée', validated_by = ?, date_validation = NOW(), updated_at = NOW()
         WHERE id_ordonnance = ?`,
        [validated_by, id_ordonnance]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('OrdonnanceModel.valider - Erreur:', error);
      throw error;
    }
  },
  marquerEnPreparation: async (id_ordonnance) => {
    try {
      const [result] = await db.execute(
        `UPDATE ordonnance SET statut = 'En préparation', updated_at = NOW() WHERE id_ordonnance = ?`,
        [id_ordonnance]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('OrdonnanceModel.marquerEnPreparation - Erreur:', error);
      throw error;
    }
  },
  delivrer: async (id_ordonnance) => {
    try {
      const [result] = await db.execute(
        `UPDATE ordonnance SET statut = 'Délivrée', date_delivrance = NOW(), updated_at = NOW() WHERE id_ordonnance = ?`,
        [id_ordonnance]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('OrdonnanceModel.delivrer - Erreur:', error);
      throw error;
    }
  },
  annuler: async (id_ordonnance) => {
    try {
      const [result] = await db.execute(
        `UPDATE ordonnance SET statut = 'Annulée', updated_at = NOW() WHERE id_ordonnance = ?`,
        [id_ordonnance]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('OrdonnanceModel.annuler - Erreur:', error);
      throw error;
    }
  },
  utiliserRenouvellement: async (id_ordonnance) => {
    try {
      const [result] = await db.execute(
        `UPDATE ordonnance 
         SET nb_renouvellements_effectues = nb_renouvellements_effectues + 1
         WHERE id_ordonnance = ? AND renouvelable = TRUE 
         AND nb_renouvellements_effectues < nb_renouvellements_autorises`,
        [id_ordonnance]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('OrdonnanceModel.utiliserRenouvellement - Erreur:', error);
      throw error;
    }
  },
  estValide: async (id_ordonnance) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          o.*,
          DATE_ADD(o.date_prescription, INTERVAL o.duree_validite DAY) as date_expiration,
          CASE 
            WHEN o.statut = 'Annulée' THEN FALSE
            WHEN DATE_ADD(o.date_prescription, INTERVAL o.duree_validite DAY) < CURDATE() THEN FALSE
            WHEN o.renouvelable = TRUE AND o.nb_renouvellements_effectues >= o.nb_renouvellements_autorises THEN FALSE
            ELSE TRUE
          END as est_valide
        FROM ordonnance o
        WHERE o.id_ordonnance = ?
      `, [id_ordonnance]);
      return rows[0];
    } catch (error) {
      console.error('OrdonnanceModel.estValide - Erreur:', error);
      throw error;
    }
  },

  countOrdonnancesThisMonth: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT COUNT(*) as total 
        FROM ordonnance 
        WHERE MONTH(date_prescription) = MONTH(CURDATE()) 
        AND YEAR(date_prescription) = YEAR(CURDATE())
      `);
      return rows[0].total;
    } catch (error) {
      console.error('OrdonnanceModel.countOrdonnancesThisMonth - Erreur:', error);
      throw error;
    }
  },
  getRecentPrescriptions: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          o.id_ordonnance,
          o.date_prescription,
          o.instructions,
          o.statut,
          o.diagnostic,
          o.urgence,
          p.nom as nom_patient,
          p.prenom as prenom_patient,
          m.nom as nom_medecin,
          m.prenom as prenom_medecin,
          COUNT(lo.id_ligne) as nombre_medicaments
        FROM ordonnance o
        INNER JOIN patient p ON o.id_patient = p.id_patient
        INNER JOIN medecin m ON o.id_medecin = m.id_medecin
        LEFT JOIN ligne_ordonnance lo ON o.id_ordonnance = lo.id_ordonnance
        GROUP BY o.id_ordonnance
        ORDER BY o.date_prescription DESC
        LIMIT 10
      `);
      return rows.map(prescription => ({
        id: prescription.id_ordonnance,
        name: `${prescription.nom_patient} ${prescription.prenom_patient}`,
        doctor: `Dr. ${prescription.prenom_medecin} ${prescription.nom_medecin}`,
        date: new Date(prescription.date_prescription).toISOString().split('T')[0],
        statut: prescription.statut,
        diagnostic: prescription.diagnostic,
        urgence: prescription.urgence,
        medicaments: prescription.nombre_medicaments || 0,
        instructions: prescription.instructions
      }));
    } catch (error) {
      console.error('OrdonnanceModel.getRecentPrescriptions - Erreur:', error);
      throw error;
    }
  },
  getStatsByStatut: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT statut, COUNT(*) as count
        FROM ordonnance 
        GROUP BY statut
        ORDER BY count DESC
      `);
      return rows;
    } catch (error) {
      console.error('OrdonnanceModel.getStatsByStatut - Erreur:', error);
      throw error;
    }
  },
  getOrdonnancesUrgentes: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          o.*,
          p.nom as patient_nom,
          p.prenom as patient_prenom,
          m.nom as medecin_nom
        FROM ordonnance o
        JOIN patient p ON o.id_patient = p.id_patient
        JOIN medecin m ON o.id_medecin = m.id_medecin
        WHERE o.urgence = TRUE AND o.statut IN ('Brouillon', 'Validée', 'En préparation')
        ORDER BY o.date_prescription DESC
      `);
      return rows;
    } catch (error) {
      console.error('OrdonnanceModel.getOrdonnancesUrgentes - Erreur:', error);
      throw error;
    }
  },

  getRenouvellementsRestants: async (id_ordonnance) => {
    try {
      const [rows] = await db.execute(
        'SELECT nb_renouvellements_autorises, nb_renouvellements_effectues FROM ordonnance WHERE id_ordonnance = ?',
        [id_ordonnance]
      );
      if (!rows.length) return 0;
      return rows[0].nb_renouvellements_autorises - rows[0].nb_renouvellements_effectues;
    } catch (error) {
      console.error('OrdonnanceModel.getRenouvellementsRestants - Erreur:', error);
      throw error;
    }
  },
  renouvelerOrdonnance: async (id_ordonnance) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [ord] = await connection.execute(
        'SELECT * FROM ordonnance WHERE id_ordonnance = ?',
        [id_ordonnance]
      );
      if (!ord.length) throw new Error('Ordonnance introuvable');
      const ordonnance = ord[0];
      if (!ordonnance.renouvelable) throw new Error('Ordonnance non renouvelable');
      if (ordonnance.nb_renouvellements_effectues >= ordonnance.nb_renouvellements_autorises)
        throw new Error('Limite de renouvellements atteinte');

      const [result] = await connection.execute(`
        INSERT INTO ordonnance (
          id_patient, id_medecin, date_prescription, instructions, statut, diagnostic,
          renouvelable, nb_renouvellements_autorises, nb_renouvellements_effectues,
          duree_validite, urgence, notes, created_by
        )
        SELECT id_patient, id_medecin, CURDATE(), instructions, 'Brouillon', diagnostic,
               renouvelable, nb_renouvellements_autorises, nb_renouvellements_effectues + 1,
               duree_validite, urgence, notes, created_by
        FROM ordonnance WHERE id_ordonnance = ?
      `, [id_ordonnance]);

      const newId = result.insertId;

      await connection.execute(`
        INSERT INTO ligne_ordonnance (
          id_ordonnance, id_medicament, quantite_prescrite, posologie, duree_traitement, voie_administration, statut, prix_unitaire
        )
        SELECT ?, id_medicament, quantite_prescrite, posologie, duree_traitement, voie_administration, 'prescrit', prix_unitaire
        FROM ligne_ordonnance
        WHERE id_ordonnance = ?
      `, [newId, id_ordonnance]);

      await connection.execute(`
        UPDATE ordonnance
        SET nb_renouvellements_effectues = nb_renouvellements_effectues + 1
        WHERE id_ordonnance = ?
      `, [id_ordonnance]);

      await connection.commit();
      return newId;
    } catch (error) {
      await connection.rollback();
      console.error('OrdonnanceModel.renouvelerOrdonnance - Erreur:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = OrdonnanceModel;