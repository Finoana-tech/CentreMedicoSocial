// models/MedicamentModel.js
const db = require('../config/db');

const MedicamentModel = {
  //  Récupérer tous les médicaments
  getAll: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT * FROM medicament 
        ORDER BY nom_commercial ASC
      `);
      return rows;
    } catch (error) {
      console.error(' MedicamentModel.getAll - Erreur:', error);
      throw error;
    }
  },

  //  Récupérer un médicament par ID
  getById: async (id) => {
    try {
      const [rows] = await db.execute('SELECT * FROM medicament WHERE id_medicament = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error(' MedicamentModel.getById - Erreur:', error);
      throw error;
    }
  },

  //  Créer un nouveau médicament
  create: async (data) => {
    try {
      console.log('🔍 MedicamentModel.create - Données reçues:', data);

      const cleanedData = {
        nom_commercial: data.nom_commercial || null,
        principe_actif: data.principe_actif || null,
        dosage: data.dosage || null,
        classe_therapeutique: data.classe_therapeutique || null,
        prescription_restreinte: data.prescription_restreinte || false,
        stock_actuel: data.stock_actuel || 0,
        stock_minimum: data.stock_minimum || 5,
        prix_unitaire: data.prix_unitaire || 0.00,
        conditions_conservation: data.conditions_conservation || 'Ambiance',
        posologie_standard: data.posologie_standard || null
      };

      const [result] = await db.execute(
        `INSERT INTO medicament (
          nom_commercial, principe_actif, dosage, classe_therapeutique,
          prescription_restreinte, stock_actuel, stock_minimum, prix_unitaire,
          conditions_conservation, posologie_standard
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanedData.nom_commercial,
          cleanedData.principe_actif,
          cleanedData.dosage,
          cleanedData.classe_therapeutique,
          cleanedData.prescription_restreinte,
          cleanedData.stock_actuel,
          cleanedData.stock_minimum,
          cleanedData.prix_unitaire,
          cleanedData.conditions_conservation,
          cleanedData.posologie_standard
        ]
      );

      console.log(' Médicament créé avec ID:', result.insertId);
      return { id_medicament: result.insertId, ...cleanedData };

    } catch (error) {
      console.error(' MedicamentModel.create - Erreur:', error);
      throw error;
    }
  },

  //  Mettre à jour un médicament existant
  update: async (id, data) => {
    try {
      console.log(' MedicamentModel.update - ID:', id, 'Données:', data);

      const cleanedData = {
        nom_commercial: data.nom_commercial || null,
        principe_actif: data.principe_actif || null,
        dosage: data.dosage || null,
        classe_therapeutique: data.classe_therapeutique || null,
        prescription_restreinte: data.prescription_restreinte || false,
        stock_actuel: data.stock_actuel || 0,
        stock_minimum: data.stock_minimum || 5,
        prix_unitaire: data.prix_unitaire || 0.00,
        conditions_conservation: data.conditions_conservation || 'Ambiance',
        posologie_standard: data.posologie_standard || null
      };

      const [result] = await db.execute(
        `UPDATE medicament 
         SET nom_commercial = ?, principe_actif = ?, dosage = ?,
             classe_therapeutique = ?, prescription_restreinte = ?,
             stock_actuel = ?, stock_minimum = ?, prix_unitaire = ?,
             conditions_conservation = ?, posologie_standard = ?
         WHERE id_medicament = ?`,
        [
          cleanedData.nom_commercial,
          cleanedData.principe_actif,
          cleanedData.dosage,
          cleanedData.classe_therapeutique,
          cleanedData.prescription_restreinte,
          cleanedData.stock_actuel,
          cleanedData.stock_minimum,
          cleanedData.prix_unitaire,
          cleanedData.conditions_conservation,
          cleanedData.posologie_standard,
          id
        ]
      );

      console.log(' Médicament mis à jour - Lignes affectées:', result.affectedRows);
      return result.affectedRows > 0 ? { id_medicament: id, ...cleanedData } : null;

    } catch (error) {
      console.error(' MedicamentModel.update - Erreur:', error);
      throw error;
    }
  },

  //  Supprimer un médicament
  delete: async (id) => {
    try {
      const [result] = await db.execute('DELETE FROM medicament WHERE id_medicament = ?', [id]);
      console.log(' Médicament supprimé - Lignes affectées:', result.affectedRows);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(' MedicamentModel.delete - Erreur:', error);
      throw error;
    }
  },

  //  Recherche (par nom commercial, principe actif, dosage OU classe thérapeutique)
  search: async (query) => {
    try {
      const q = `%${query}%`;
      const [rows] = await db.execute(
        `SELECT * FROM medicament 
         WHERE nom_commercial LIKE ? 
            OR principe_actif LIKE ? 
            OR dosage LIKE ?
            OR classe_therapeutique LIKE ?`,
        [q, q, q, q]
      );
      return rows;
    } catch (error) {
      console.error(' MedicamentModel.search - Erreur:', error);
      throw error;
    }
  },

  //  Vérifier les doublons (même nom_commercial et dosage)
  checkDuplicate: async (nom_commercial, dosage, excludeId = null) => {
    try {
      let query = `SELECT COUNT(*) AS count 
                   FROM medicament 
                   WHERE nom_commercial = ? AND dosage = ?`;
      const params = [nom_commercial, dosage];

      if (excludeId) {
        query += ' AND id_medicament != ?';
        params.push(excludeId);
      }

      const [rows] = await db.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error(' MedicamentModel.checkDuplicate - Erreur:', error);
      throw error;
    }
  },

  //  NOUVELLE MÉTHODE: Récupérer les médicaments avec stock critique
  getStockCritique: async () => {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM medicament 
         WHERE stock_actuel <= stock_minimum
         ORDER BY stock_actuel ASC`
      );
      return rows;
    } catch (error) {
      console.error(' MedicamentModel.getStockCritique - Erreur:', error);
      throw error;
    }
  },

  //  NOUVELLE MÉTHODE: Récupérer les médicaments par classe thérapeutique
  getByClasseTherapeutique: async (classe) => {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM medicament 
         WHERE classe_therapeutique = ?
         ORDER BY nom_commercial ASC`,
        [classe]
      );
      return rows;
    } catch (error) {
      console.error(' MedicamentModel.getByClasseTherapeutique - Erreur:', error);
      throw error;
    }
  },

  //  NOUVELLE MÉTHODE: Mettre à jour le stock
  updateStock: async (id, nouveauStock) => {
    try {
      const [result] = await db.execute(
        `UPDATE medicament SET stock_actuel = ? WHERE id_medicament = ?`,
        [nouveauStock, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(' MedicamentModel.updateStock - Erreur:', error);
      throw error;
    }
  }
};

module.exports = MedicamentModel;