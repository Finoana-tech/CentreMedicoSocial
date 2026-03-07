const db = require('../config/db');

const PatientModel = {
  getAll: async () => {
    try {
      const [rows] = await db.execute('SELECT * FROM patient ORDER BY nom ASC');
      return rows;
    } catch (error) {
      console.error('❌ PatientModel.getAll - Erreur:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await db.execute('SELECT * FROM patient WHERE id_patient = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('❌ PatientModel.getById - Erreur:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log('🔍 PatientModel.create - Données reçues:', data);
      
      // Nettoyer les données : remplacer undefined par null
      const cleanedData = {
        nom: data.nom || null,
        prenom: data.prenom || null,
        date_naissance: data.date_naissance || null,
        sexe: data.sexe || null,
        adresse: data.adresse || null,
        telephone: data.telephone || null,
        email: data.email || null,
        id_tuteur: data.id_tuteur || null,
        lien_familial: data.lien_familial || null
      };
      
      console.log('🧹 Données nettoyées:', cleanedData);
      
      const [result] = await db.execute(
        `INSERT INTO patient
         (nom, prenom, date_naissance, sexe, adresse, telephone, email, id_tuteur, lien_familial)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanedData.nom,
          cleanedData.prenom,
          cleanedData.date_naissance,
          cleanedData.sexe,
          cleanedData.adresse,
          cleanedData.telephone,
          cleanedData.email,
          cleanedData.id_tuteur,
          cleanedData.lien_familial
        ]
      );
      
      console.log('✅ Patient créé avec ID:', result.insertId);
      return { id_patient: result.insertId, ...cleanedData };
      
    } catch (error) {
      console.error('❌ PatientModel.create - Erreur:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log('🔍 PatientModel.update - ID:', id, 'Données:', data);
      
      // Nettoyer les données
      const cleanedData = {
        nom: data.nom || null,
        prenom: data.prenom || null,
        date_naissance: data.date_naissance || null,
        sexe: data.sexe || null,
        adresse: data.adresse || null,
        telephone: data.telephone || null,
        email: data.email || null,
        id_tuteur: data.id_tuteur || null,
        lien_familial: data.lien_familial || null
      };
      
      const [result] = await db.execute(
        `UPDATE patient SET 
            nom=?, prenom=?, date_naissance=?, sexe=?, adresse=?, telephone=?, email=?, id_tuteur=?, lien_familial=?
         WHERE id_patient=?`,
        [
          cleanedData.nom,
          cleanedData.prenom,
          cleanedData.date_naissance,
          cleanedData.sexe,
          cleanedData.adresse,
          cleanedData.telephone,
          cleanedData.email,
          cleanedData.id_tuteur,
          cleanedData.lien_familial,
          id
        ]
      );
      
      console.log('✅ Patient mis à jour - Lignes affectées:', result.affectedRows);
      return result.affectedRows > 0 ? { id_patient: id, ...cleanedData } : null;
      
    } catch (error) {
      console.error('❌ PatientModel.update - Erreur:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const [result] = await db.execute('DELETE FROM patient WHERE id_patient = ?', [id]);
      console.log(' Patient supprimé - Lignes affectées:', result.affectedRows);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(' PatientModel.delete - Erreur:', error);
      throw error;
    }
  },

  search: async (query) => {
    try {
      const q = `%${query}%`;
      const [rows] = await db.execute(
        `SELECT * FROM patient 
         WHERE nom LIKE ? OR prenom LIKE ? OR telephone LIKE ? OR email LIKE ?`,
        [q, q, q, q]
      );
      return rows;
    } catch (error) {
      console.error(' PatientModel.search - Erreur:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const [rows] = await db.execute(
        `SELECT sexe, COUNT(*) AS total FROM patient GROUP BY sexe`
      );
      return rows;
    } catch (error) {
      console.error('❌ PatientModel.getStats - Erreur:', error);
      throw error;
    }
  },

  getTuteursPotentiels: async () => {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM patient WHERE id_tuteur IS NULL ORDER BY nom ASC'
      );
      return rows;
    } catch (error) {
      console.error('❌ PatientModel.getTuteursPotentiels - Erreur:', error);
      throw error;
    }
  },

  getByTuteur: async (tuteurId) => {
    try {
      const [rows] = await db.execute('SELECT * FROM patient WHERE id_tuteur = ?', [tuteurId]);
      return rows;
    } catch (error) {
      console.error('❌ PatientModel.getByTuteur - Erreur:', error);
      throw error;
    }
  },

  getPatientsAvecDernierRV: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, MAX(r.date_heure_debut) AS dernier_rendez_vous
        FROM patient p
        LEFT JOIN rendez_vous r ON p.id_patient = r.id_patient
        GROUP BY p.id_patient
        ORDER BY dernier_rendez_vous DESC
      `);
      return rows;
    } catch (error) {
      console.error('❌ PatientModel.getPatientsAvecDernierRV - Erreur:', error);
      throw error;
    }
  },

  // Ajout des méthodes manquantes pour le contrôleur
  checkDuplicate: async (nom, prenom, date_naissance, email, excludeId = null) => {
    try {
      let query = `
        SELECT COUNT(*) as count 
        FROM patient 
        WHERE nom = ? AND prenom = ? AND date_naissance = ?
      `;
      const params = [nom, prenom, date_naissance];
      
      if (email) {
        query += ' OR email = ?';
        params.push(email);
      }
      
      if (excludeId) {
        query += ' AND id_patient != ?';
        params.push(excludeId);
      }
      
      const [rows] = await db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('❌ PatientModel.checkDuplicate - Erreur:', error);
      throw error;
    }
  },

  getAge: async (id) => {
    try {
      const [rows] = await db.execute(
        'SELECT TIMESTAMPDIFF(YEAR, date_naissance, CURDATE()) as age FROM patient WHERE id_patient = ?',
        [id]
      );
      return rows[0]?.age || 0;
    } catch (error) {
      console.error('❌ PatientModel.getAge - Erreur:', error);
      throw error;
    }
  },

  // === NOUVELLE MÉTHODE POUR LE DASHBOARD ===
  /**
   * Compter le nombre total de patients pour le dashboard
   */
  countPatients: async () => {
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as total FROM patient');
      return rows[0].total;
    } catch (error) {
      console.error('❌ PatientModel.countPatients - Erreur:', error);
      throw error;
    }
  }
};

module.exports = PatientModel;