const db = require('../config/db');

const LigneOrdonnanceModel = {

  getAll: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          lo.*,
          m.nom_commercial,
          m.principe_actif,
          m.dosage as medicament_dosage,
          m.classe_therapeutique,
          o.date_prescription,
          o.statut as ordonnance_statut
        FROM ligne_ordonnance lo
        JOIN medicament m ON lo.id_medicament = m.id_medicament
        JOIN ordonnance o ON lo.id_ordonnance = o.id_ordonnance
        ORDER BY o.date_prescription DESC, lo.id_ligne ASC
      `);
      return rows;
    } catch (error) {
      console.error(' LigneOrdonnanceModel.getAll - Erreur:', error);
      throw error;
    }
  },

  getByOrdonnanceId: async (id_ordonnance) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          lo.*,
          m.nom_commercial,
          m.principe_actif,
          m.dosage as medicament_dosage,
          m.prix_unitaire,
          m.stock_actuel
        FROM ligne_ordonnance lo
        JOIN medicament m ON lo.id_medicament = m.id_medicament
        WHERE lo.id_ordonnance = ?
        ORDER BY lo.id_ligne ASC
      `, [id_ordonnance]);
      return rows;
    } catch (error) {
      console.error(' LigneOrdonnanceModel.getByOrdonnanceId - Erreur:', error);
      throw error;
    }
  },

  getById: async (id_ligne) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          lo.*,
          m.nom_commercial,
          m.principe_actif,
          m.dosage as medicament_dosage,
          m.classe_therapeutique,
          m.prescription_restreinte,
          o.date_prescription,
          o.id_patient,
          o.id_medecin
        FROM ligne_ordonnance lo
        JOIN medicament m ON lo.id_medicament = m.id_medicament
        JOIN ordonnance o ON lo.id_ordonnance = o.id_ordonnance
        WHERE lo.id_ligne = ?
      `, [id_ligne]);
      return rows[0];
    } catch (error) {
      console.error(' LigneOrdonnanceModel.getById - Erreur:', error);
      throw error;
    }
  },

  //  Créer une nouvelle ligne d'ordonnance
  create: async (data) => {
    try {
      const cleanedData = {
        id_ordonnance: data.id_ordonnance || null,
        id_medicament: data.id_medicament || null,
        quantite_prescrite: data.quantite_prescrite || 1,
        quantite_delivree: data.quantite_delivree || null,
        posologie: data.posologie || '',
        duree_traitement: data.duree_traitement || 7,
        voie_administration: data.voie_administration || 'Orale',
        statut: data.statut || 'prescrit',
        notes: data.notes || null,
        contre_indications: data.contre_indications || null,
        prix_unitaire: data.prix_unitaire || 0.00,
        date_delivrance: data.date_delivrance || null
      };

      const [result] = await db.execute(`
        INSERT INTO ligne_ordonnance (
          id_ordonnance, id_medicament, quantite_prescrite, quantite_delivree,
          posologie, duree_traitement, voie_administration, statut,
          notes, contre_indications, prix_unitaire, date_delivrance
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cleanedData.id_ordonnance,
        cleanedData.id_medicament,
        cleanedData.quantite_prescrite,
        cleanedData.quantite_delivree,
        cleanedData.posologie,
        cleanedData.duree_traitement,
        cleanedData.voie_administration,
        cleanedData.statut,
        cleanedData.notes,
        cleanedData.contre_indications,
        cleanedData.prix_unitaire,
        cleanedData.date_delivrance
      ]);

      return { id_ligne: result.insertId, ...cleanedData };
    } catch (error) {
      console.error(' LigneOrdonnanceModel.create - Erreur:', error);
      throw error;
    }
  },

  //  Mettre à jour une ligne d'ordonnance
  update: async (id_ligne, data) => {
    try {
      const cleanedData = {
        id_medicament: data.id_medicament || null,
        quantite_prescrite: data.quantite_prescrite || 1,
        quantite_delivree: data.quantite_delivree || null,
        posologie: data.posologie || '',
        duree_traitement: data.duree_traitement || 7,
        voie_administration: data.voie_administration || 'Orale',
        statut: data.statut || 'prescrit',
        notes: data.notes || null,
        contre_indications: data.contre_indications || null,
        prix_unitaire: data.prix_unitaire || 0.00,
        date_delivrance: data.date_delivrance || null
      };

      const [result] = await db.execute(`
        UPDATE ligne_ordonnance 
        SET 
          id_medicament = ?, quantite_prescrite = ?, quantite_delivree = ?,
          posologie = ?, duree_traitement = ?, voie_administration = ?, statut = ?,
          notes = ?, contre_indications = ?, prix_unitaire = ?, date_delivrance = ?
        WHERE id_ligne = ?
      `, [
        cleanedData.id_medicament,
        cleanedData.quantite_prescrite,
        cleanedData.quantite_delivree,
        cleanedData.posologie,
        cleanedData.duree_traitement,
        cleanedData.voie_administration,
        cleanedData.statut,
        cleanedData.notes,
        cleanedData.contre_indications,
        cleanedData.prix_unitaire,
        cleanedData.date_delivrance,
        id_ligne
      ]);

      return result.affectedRows > 0 ? { id_ligne, ...cleanedData } : null;
    } catch (error) {
      console.error(' LigneOrdonnanceModel.update - Erreur:', error);
      throw error;
    }
  },

  //  Mettre à jour le statut d'une ligne
  updateStatut: async (id_ligne, statut, quantite_delivree = null, date_delivrance = null) => {
    try {
      const [result] = await db.execute(`
        UPDATE ligne_ordonnance 
        SET statut = ?, quantite_delivree = ?, date_delivrance = ?
        WHERE id_ligne = ?
      `, [statut, quantite_delivree, date_delivrance, id_ligne]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error(' LigneOrdonnanceModel.updateStatut - Erreur:', error);
      throw error;
    }
  },

  //  Mettre à jour la quantité délivrée
  updateQuantiteDelivree: async (id_ligne, quantite_delivree, date_delivrance = null) => {
    try {
      const statut = quantite_delivree > 0 ? 'delivre' : 'prescrit';
      const [result] = await db.execute(`
        UPDATE ligne_ordonnance 
        SET quantite_delivree = ?, date_delivrance = ?, statut = ?
        WHERE id_ligne = ?
      `, [quantite_delivree, date_delivrance, statut, id_ligne]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error(' LigneOrdonnanceModel.updateQuantiteDelivree - Erreur:', error);
      throw error;
    }
  },

  //  Supprimer une ligne d'ordonnance
  delete: async (id_ligne) => {
    try {
      const [result] = await db.execute('DELETE FROM ligne_ordonnance WHERE id_ligne = ?', [id_ligne]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(' LigneOrdonnanceModel.delete - Erreur:', error);
      throw error;
    }
  },

  //  Supprimer toutes les lignes d'une ordonnance
  deleteByOrdonnance: async (id_ordonnance) => {
    try {
      const [result] = await db.execute('DELETE FROM ligne_ordonnance WHERE id_ordonnance = ?', [id_ordonnance]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(' LigneOrdonnanceModel.deleteByOrdonnance - Erreur:', error);
      throw error;
    }
  },

  // Récupérer les lignes par statut
  getByStatut: async (statut) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          lo.*,
          m.nom_commercial,
          m.principe_actif,
          o.date_prescription,
          o.id_patient
        FROM ligne_ordonnance lo
        JOIN medicament m ON lo.id_medicament = m.id_medicament
        JOIN ordonnance o ON lo.id_ordonnance = o.id_ordonnance
        WHERE lo.statut = ?
        ORDER BY o.date_prescription DESC
      `, [statut]);
      return rows;
    } catch (error) {
      console.error(' LigneOrdonnanceModel.getByStatut - Erreur:', error);
      throw error;
    }
  },

  //Récupérer les lignes en attente de délivrance
  getEnAttenteDelivrance: async () => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          lo.*,
          m.nom_commercial,
          m.stock_actuel,
          o.date_prescription,
          o.id_patient
        FROM ligne_ordonnance lo
        JOIN medicament m ON lo.id_medicament = m.id_medicament
        JOIN ordonnance o ON lo.id_ordonnance = o.id_ordonnance
        WHERE lo.statut IN ('prescrit', 'en_preparation')
        AND (lo.quantite_delivree IS NULL OR lo.quantite_delivree < lo.quantite_prescrite)
        ORDER BY o.date_prescription ASC
      `);
      return rows;
    } catch (error) {
      console.error(' LigneOrdonnanceModel.getEnAttenteDelivrance - Erreur:', error);
      throw error;
    }
  },

  //  Vérifier le stock disponible pour une ligne
  verifierStock: async (id_ligne) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          lo.quantite_prescrite,
          lo.quantite_delivree,
          m.stock_actuel,
          m.nom_commercial,
          (m.stock_actuel - COALESCE(lo.quantite_prescrite, 0)) as stock_restant
        FROM ligne_ordonnance lo
        JOIN medicament m ON lo.id_medicament = m.id_medicament
        WHERE lo.id_ligne = ?
      `, [id_ligne]);
      return rows[0];
    } catch (error) {
      console.error(' LigneOrdonnanceModel.verifierStock - Erreur:', error);
      throw error;
    }
  },

  //  Calculer le total d'une ordonnance
  getTotalOrdonnance: async (id_ordonnance) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          COUNT(*) as nb_medicaments,
          SUM(lo.quantite_prescrite) as total_quantite,
          SUM(lo.quantite_prescrite * COALESCE(lo.prix_unitaire, 0)) as total_prix
        FROM ligne_ordonnance lo
        WHERE lo.id_ordonnance = ?
      `, [id_ordonnance]);
      return rows[0];
    } catch (error) {
      console.error(' LigneOrdonnanceModel.getTotalOrdonnance - Erreur:', error);
      throw error;
    }
  }
};

module.exports = LigneOrdonnanceModel;