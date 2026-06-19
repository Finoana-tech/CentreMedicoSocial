const db = require('../config/db');

const RendezVousModel = {
  getAll: async (filters = {}) => {
    try {
      let sql = `
        SELECT 
          r.*,
          p.nom AS patient_nom,
          p.prenom AS patient_prenom,
          p.email AS patient_email,
          p.telephone AS patient_telephone,
          m.nom AS medecin_nom,
          m.prenom AS medecin_prenom,
          m.specialite AS medecin_specialite,
          m.disponibilite AS medecin_disponibilite
        FROM rendez_vous r
        JOIN patient p ON r.id_patient = p.id_patient
        JOIN medecin m ON r.id_medecin = m.id_medecin
        WHERE 1=1
      `;
      
      const params = [];

      if (filters.statut) {
        sql += ' AND r.statut = ?';
        params.push(filters.statut);
      }

      if (filters.id_medecin) {
        sql += ' AND r.id_medecin = ?';
        params.push(filters.id_medecin);
      }

      if (filters.date) {
        sql += ' AND DATE(r.date_heure) = ?';
        params.push(filters.date);
      }

      sql += ' ORDER BY r.date_heure DESC';

      const [rows] = await db.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('RendezVousModel.getAll - Erreur:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          r.*,
          p.nom AS patient_nom,
          p.prenom AS patient_prenom,
          p.email AS patient_email,
          p.telephone AS patient_telephone,
          m.nom AS medecin_nom,
          m.prenom AS medecin_prenom,
          m.specialite AS medecin_specialite,
          m.telephone AS medecin_telephone,
          m.email AS medecin_email,
          m.disponibilite AS medecin_disponibilite
        FROM rendez_vous r
        JOIN patient p ON r.id_patient = p.id_patient
        JOIN medecin m ON r.id_medecin = m.id_medecin
        WHERE r.id_rendez_vous = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('RendezVousModel.getById - Erreur:', error);
      throw error;
    }
  },

  create: async (data) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      console.log('RendezVousModel.create - Données reçues:', data);

      const cleanedData = {
        id_patient: data.id_patient || null,
        id_medecin: data.id_medecin || null,
        date_heure: data.date_heure || null,
        motif: data.motif || null,
        statut: data.statut || 'planifie',
        duree: data.duree || 30
      };
      
      const disponibilite = await RendezVousModel.verifierDisponibiliteComplete(
        cleanedData.id_medecin, 
        cleanedData.date_heure, 
        cleanedData.duree,
        null 
      );

      if (!disponibilite.disponible) {
        throw new Error(disponibilite.raison);
      }

      const [result] = await connection.execute(
        `INSERT INTO rendez_vous 
         (id_patient, id_medecin, date_heure, motif, statut, duree)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          cleanedData.id_patient,
          cleanedData.id_medecin,
          cleanedData.date_heure,
          cleanedData.motif,
          cleanedData.statut,
          cleanedData.duree
        ]
      );

      const maintenant = new Date();
      const dateRdv = new Date(cleanedData.date_heure);
      
      if (dateRdv <= new Date(maintenant.getTime() + 30 * 60000)) {
        await connection.execute(
          `UPDATE medecin SET disponibilite = 'en_consultation' WHERE id_medecin = ?`,
          [cleanedData.id_medecin]
        );
      }

      await connection.commit();
      console.log('Rendez-vous créé avec ID:', result.insertId);
      return { id_rendez_vous: result.insertId, ...cleanedData };

    } catch (error) {
      await connection.rollback();
      console.error('RendezVousModel.create - Erreur:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  update: async (id, data) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      console.log('RendezVousModel.update - ID:', id, 'Données:', data);

      const [ancienRdv] = await connection.execute(
        'SELECT * FROM rendez_vous WHERE id_rendez_vous = ?',
        [id]
      );

      if (ancienRdv.length === 0) {
        throw new Error('Rendez-vous non trouvé');
      }

      const ancienData = ancienRdv[0];
      const cleanedData = {
        id_patient: data.id_patient || ancienData.id_patient,
        id_medecin: data.id_medecin || ancienData.id_medecin,
        date_heure: data.date_heure || ancienData.date_heure,
        motif: data.motif || ancienData.motif,
        statut: data.statut || ancienData.statut,
        duree: data.duree || ancienData.duree
      };

      if (data.id_medecin || data.date_heure) {
        const disponibilite = await RendezVousModel.verifierDisponibiliteComplete(
          cleanedData.id_medecin, 
          cleanedData.date_heure, 
          cleanedData.duree,
          id 
        );

        if (!disponibilite.disponible) {
          throw new Error(disponibilite.raison);
        }
      }

      const [result] = await connection.execute(
        `UPDATE rendez_vous 
         SET id_patient=?, id_medecin=?, date_heure=?, motif=?, statut=?, duree=?
         WHERE id_rendez_vous=?`,
        [
          cleanedData.id_patient,
          cleanedData.id_medecin,
          cleanedData.date_heure,
          cleanedData.motif,
          cleanedData.statut,
          cleanedData.duree,
          id
        ]
      );

      if (cleanedData.statut === 'en_cours' || cleanedData.statut === 'termine' || cleanedData.statut === 'annule') {
        await RendezVousModel.gestionDisponibiliteAutomatique(
          cleanedData.id_medecin, 
          cleanedData.date_heure, 
          cleanedData.statut,
          connection
        );
      }

      await connection.commit();
      console.log('Rendez-vous mis à jour - Lignes affectées:', result.affectedRows);
      return result.affectedRows > 0 ? { id_rendez_vous: id, ...cleanedData } : null;

    } catch (error) {
      await connection.rollback();
      console.error('RendezVousModel.update - Erreur:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  delete: async (id) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const [rdv] = await connection.execute(
        'SELECT id_medecin, statut FROM rendez_vous WHERE id_rendez_vous = ?',
        [id]
      );

      const [result] = await connection.execute(
        'DELETE FROM rendez_vous WHERE id_rendez_vous = ?', 
        [id]
      );

      if (rdv.length > 0 && rdv[0].statut === 'en_cours') {
        await connection.execute(
          'UPDATE medecin SET disponibilite = "disponible" WHERE id_medecin = ? AND disponibilite = "en_consultation"',
          [rdv[0].id_medecin]
        );
      }

      await connection.commit();
      console.log('Rendez-vous supprimé - Lignes affectées:', result.affectedRows);
      return result.affectedRows > 0;

    } catch (error) {
      await connection.rollback();
      console.error('RendezVousModel.delete - Erreur:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  annuler: async (id, raison = "Annulation par le patient") => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `UPDATE rendez_vous 
         SET statut = 'annule', motif = CONCAT(COALESCE(motif, ''), ' - Annulation: ', ?)
         WHERE id_rendez_vous = ?`,
        [raison, id]
      );

      const [rdv] = await connection.execute(
        'SELECT id_medecin, statut FROM rendez_vous WHERE id_rendez_vous = ?',
        [id]
      );

      if (rdv.length > 0 && rdv[0].statut === 'en_cours') {
        await connection.execute(
          'UPDATE medecin SET disponibilite = "disponible" WHERE id_medecin = ? AND disponibilite = "en_consultation"',
          [rdv[0].id_medecin]
        );
      }

      await connection.commit();
      console.log('Rendez-vous annulé - Lignes affectées:', result.affectedRows);
      return result.affectedRows > 0;

    } catch (error) {
      await connection.rollback();
      console.error('RendezVousModel.annuler - Erreur:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  checkDuplicate: async (id_medecin, date_heure, duree = 30, excludeId = null, connection = null) => {
    const dbConn = connection || db;
    
    try {
      const start = new Date(date_heure);
      const end = new Date(start.getTime() + duree * 60000);

      let sql = `
        SELECT COUNT(*) as count, 
               GROUP_CONCAT(CONCAT(statut, ' à ', DATE_FORMAT(date_heure, '%H:%i'))) as conflits
        FROM rendez_vous
        WHERE id_medecin = ?
          AND statut IN ('planifie', 'en_cours')
          AND (
            (date_heure < ? AND DATE_ADD(date_heure, INTERVAL duree MINUTE) > ?)
            OR
            (date_heure >= ? AND date_heure < ?)
          )
      `;

      const params = [
        id_medecin,
        end.toISOString().slice(0, 19).replace('T', ' '),
        start.toISOString().slice(0, 19).replace('T', ' '),
        start.toISOString().slice(0, 19).replace('T', ' '),
        end.toISOString().slice(0, 19).replace('T', ' ')
      ];

      if (excludeId) {
        sql += ' AND id_rendez_vous != ?';
        params.push(excludeId);
      }

      const [rows] = await dbConn.execute(sql, params);
      
      if (rows[0].count > 0) {
        console.log(`Conflit détecté pour médecin ${id_medecin} à ${date_heure}:`, rows[0].conflits);
        return {
          hasConflict: true,
          details: rows[0].conflits
        };
      }
      
      return { hasConflict: false };

    } catch (error) {
      console.error('RendezVousModel.checkDuplicate - Erreur:', error);
      throw error;
    }
  },

  verifierHoraireTravail: async (date_heure, duree = 30) => {
    try {
      const start = new Date(date_heure);
      const end = new Date(start.getTime() + duree * 60000);

      const day = start.getDay();
      if (day === 0 || day === 6) {
        return { 
          valide: false, 
          raison: "Le centre est fermé le week-end" 
        };
      }

      const startHour = start.getHours();
      const startMinute = start.getMinutes();
      const endHour = end.getHours();
      const endMinute = end.getMinutes();

      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      const morningStart = 7 * 60 + 30;  // 07:30
      const morningEnd = 12 * 60;        // 12:00
      const afternoonStart = 14 * 60;    // 14:00
      const afternoonEnd = 17 * 60 + 30; // 17:30

      const inMorning = (startTime >= morningStart && endTime <= morningEnd);
      const inAfternoon = (startTime >= afternoonStart && endTime <= afternoonEnd);

      if (!inMorning && !inAfternoon) {
        return { 
          valide: false, 
          raison: "Hors des horaires de travail (07:30-12:00 / 14:00-17:30)" 
        };
      }

      const chevauchePause = (startTime < morningEnd && endTime > afternoonStart);
      if (chevauchePause) {
        return { 
          valide: false, 
          raison: "Le rendez-vous chevauche la pause déjeuner (12:00-14:00)" 
        };
      }

      return { valide: true };
    } catch (error) {
      console.error('RendezVousModel.verifierHoraireTravail - Erreur:', error);
      return { 
        valide: false, 
        raison: "Erreur lors de la vérification des horaires" 
      };
    }
  },

  gestionDisponibiliteAutomatique: async (id_medecin, date_heure, statut, connection) => {
    try {
      
      if (statut === 'en_cours') {
        await connection.execute(
          'UPDATE medecin SET disponibilite = "en_consultation" WHERE id_medecin = ? AND disponibilite = "disponible"',
          [id_medecin]
        );
      } else if (statut === 'termine' || statut === 'annule') {
        await connection.execute(
          'UPDATE medecin SET disponibilite = "disponible" WHERE id_medecin = ? AND disponibilite = "en_consultation"',
          [id_medecin]
        );
      }
    } catch (error) {
      console.error('RendezVousModel.gestionDisponibiliteAutomatique - Erreur:', error);
      throw error;
    }
  },

verifierDisponibiliteComplete: async (id_medecin, date_heure, duree = 30, excludeRdvId = null) => {
  try {

    let medecinId;
    try {
      medecinId = parseInt(id_medecin);
      if (isNaN(medecinId) || medecinId <= 0) {
        console.error('ID médecin invalide:', id_medecin);
        return { disponible: false, raison: 'ID du médecin invalide' };
      }
    } catch (error) {
      console.error('Erreur conversion ID médecin:', error);
      return { disponible: false, raison: 'ID du médecin invalide' };
    }

    const [medecin] = await db.execute(
      'SELECT disponibilite, nom, prenom FROM medecin WHERE id_medecin = ?',
      [medecinId] 
    );

    if (medecin.length === 0) {
      return { disponible: false, raison: 'Médecin non trouvé' };
    }

    const disponibiliteManuelle = medecin[0].disponibilite;
    const nomMedecin = `Dr ${medecin[0].prenom} ${medecin[0].nom}`;
    
    if (disponibiliteManuelle !== 'disponible' && disponibiliteManuelle !== 'en_consultation') {
      let message = '';
      switch(disponibiliteManuelle) {
        case 'pause':
          message = `${nomMedecin} est actuellement en pause`;
          break;
        case 'chirurgie':
          message = `${nomMedecin} est actuellement en chirurgie`;
          break;
        case 'conges':
          message = `${nomMedecin} est actuellement en congés`;
          break;
        case 'hors_service':
          message = `${nomMedecin} est actuellement hors service`;
          break;
        case 'urgence':
          message = `${nomMedecin} est actuellement en urgence médicale`;
          break;
        default:
          message = `${nomMedecin} n'est pas disponible pour les rendez-vous`;
      }
      return { disponible: false, raison: message };
    }

    const horaireValide = await RendezVousModel.verifierHoraireTravail(date_heure, duree);
    if (!horaireValide.valide) {
      return { disponible: false, raison: horaireValide.raison };
    }

    const conflit = await RendezVousModel.checkDuplicate(medecinId, date_heure, duree, excludeRdvId);
    if (conflit.hasConflict) {
      return { 
        disponible: false, 
        raison: `Le médecin a déjà un rendez-vous programmé à cette heure (${conflit.details})` 
      };
    }

    return { disponible: true };

  } catch (error) {
    console.error('RendezVousModel.verifierDisponibiliteComplete - Erreur:', error);
    return { 
      disponible: false, 
      raison: 'Erreur lors de la vérification de disponibilité' 
    };
  }
},

  getTodayAppointments: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT r.*,
               p.nom AS patient_nom,
               p.prenom AS patient_prenom,
               m.nom AS medecin_nom,
               m.prenom AS medecin_prenom,
               m.disponibilite AS medecin_disponibilite
        FROM rendez_vous r
        JOIN patient p ON r.id_patient = p.id_patient
        JOIN medecin m ON r.id_medecin = m.id_medecin
        WHERE DATE(r.date_heure) = CURDATE()
        ORDER BY r.date_heure ASC
      `);
      return rows;
    } catch (error) {
      console.error('RendezVousModel.getTodayAppointments - Erreur:', error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const [todayCount] = await db.execute(
        'SELECT COUNT(*) as total FROM rendez_vous WHERE DATE(date_heure) = CURDATE()'
      );
      const [pendingCount] = await db.execute(
        'SELECT COUNT(*) as total FROM rendez_vous WHERE statut = "planifie"'
      );
      const [inProgressCount] = await db.execute(
        'SELECT COUNT(*) as total FROM rendez_vous WHERE statut = "en_cours"'
      );

      return {
        aujourdhui: todayCount[0].total,
        en_attente: pendingCount[0].total,
        en_cours: inProgressCount[0].total
      };
    } catch (error) {
      console.error('RendezVousModel.getDashboardStats - Erreur:', error);
      throw error;
    }
  },

  checkAvailability: async (id_medecin, date_heure, duree = 30, excludeRdvId = null) => {
    try {
      return await RendezVousModel.verifierDisponibiliteComplete(
        id_medecin, 
        date_heure, 
        duree, 
        excludeRdvId
      );
    } catch (error) {
      console.error('RendezVousModel.checkAvailability - Erreur:', error);
      return { 
        disponible: false, 
        raison: 'Erreur lors de la vérification de disponibilité' 
      };
    }
  }
};

module.exports = RendezVousModel;