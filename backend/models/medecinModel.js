const db = require('../config/db');

const MedecinModel = {
  getAll: async () => {
    try {
      const [rows] = await db.execute('SELECT * FROM medecin ORDER BY nom ASC');
      return rows;
    } catch (error) {
      console.error('MedecinModel.getAll - Erreur:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await db.execute('SELECT * FROM medecin WHERE id_medecin = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('MedecinModel.getById - Erreur:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log('MedecinModel.create - Données reçues:', data);

      const cleanedData = {
        nom: data.nom || null,
        prenom: data.prenom || null,
        specialite: data.specialite || null,
        telephone: data.telephone || null,
        adresse: data.adresse || null,
        email: data.email || null,
        disponibilite: data.disponibilite || 'disponible'
      };

      const [result] = await db.execute(
        `INSERT INTO medecin (nom, prenom, specialite, telephone, adresse, email, disponibilite)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [cleanedData.nom, cleanedData.prenom, cleanedData.specialite, cleanedData.telephone, cleanedData.adresse, cleanedData.email, cleanedData.disponibilite]
      );

      console.log('Medecin créé avec ID:', result.insertId);
      return { id_medecin: result.insertId, ...cleanedData };

    } catch (error) {
      console.error('MedecinModel.create - Erreur:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log('MedecinModel.update - ID:', id, 'Données:', data);

      const cleanedData = {
        nom: data.nom || null,
        prenom: data.prenom || null,
        specialite: data.specialite || null,
        telephone: data.telephone || null,
        adresse: data.adresse || null,
        email: data.email || null,
        disponibilite: data.disponibilite || 'disponible'
      };

      const [result] = await db.execute(
        `UPDATE medecin SET nom=?, prenom=?, specialite=?, telephone=?, adresse=?, email=?, disponibilite=? WHERE id_medecin=?`,
        [cleanedData.nom, cleanedData.prenom, cleanedData.specialite, cleanedData.telephone, cleanedData.adresse, cleanedData.email, cleanedData.disponibilite, id]
      );

      console.log('Medecin mis à jour - Lignes affectées:', result.affectedRows);
      return result.affectedRows > 0 ? { id_medecin: id, ...cleanedData } : null;

    } catch (error) {
      console.error('MedecinModel.update - Erreur:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const [result] = await db.execute('DELETE FROM medecin WHERE id_medecin = ?', [id]);
      console.log('Medecin supprimé - Lignes affectées:', result.affectedRows);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('MedecinModel.delete - Erreur:', error);
      throw error;
    }
  },

  search: async (query) => {
    try {
      const q = `%${query}%`;
      const [rows] = await db.execute(
        `SELECT * FROM medecin 
         WHERE nom LIKE ? OR prenom LIKE ? OR specialite LIKE ? OR telephone LIKE ? OR adresse LIKE ? OR email LIKE ?`,
        [q, q, q, q, q, q]
      );
      return rows;
    } catch (error) {
      console.error('MedecinModel.search - Erreur:', error);
      throw error;
    }
  },

  checkDuplicate: async (nom, prenom, telephone, excludeId = null) => {
    try {
      let query = `SELECT COUNT(*) as count FROM medecin WHERE nom = ? AND prenom = ?`;
      const params = [nom, prenom];

      if (telephone) {
        query += ' OR telephone = ?';
        params.push(telephone);
      }

      if (excludeId) {
        query += ' AND id_medecin != ?';
        params.push(excludeId);
      }

      const [rows] = await db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('MedecinModel.checkDuplicate - Erreur:', error);
      throw error;
    }
  },

  countMedecins: async () => {
    try {
      const [rows] = await db.execute('SELECT COUNT(*) as total FROM medecin');
      return rows[0].total;
    } catch (error) {
      console.error('MedecinModel.countMedecins - Erreur:', error);
      throw error;
    }
  },

  countMedecinsActifs: async () => {
    try {
      const [rows] = await db.execute(`SELECT COUNT(*) as total 
         FROM medecin 
         WHERE disponibilite IN ('disponible', 'en_consultation', 'chirurgie', 'pause')`);
      return rows[0].total;
    } catch (error) {
      console.error('MedecinModel.countMedecinsActifs - Erreur:', error);
      throw error;
    }
  },

  updateDisponibilite: async (id, disponibilite) => {
    try {
      const [result] = await db.execute(
        'UPDATE medecin SET disponibilite = ? WHERE id_medecin = ?',
        [disponibilite, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('MedecinModel.updateDisponibilite - Erreur:', error);
      throw error;
    }
  },

  getByDisponibilite: async (disponibilite) => {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM medecin WHERE disponibilite = ? ORDER BY nom ASC',
        [disponibilite]
      );
      return rows;
    } catch (error) {
      console.error('MedecinModel.getByDisponibilite - Erreur:', error);
      throw error;
    }
  }
};

module.exports = MedecinModel;