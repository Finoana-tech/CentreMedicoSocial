const LigneOrdonnanceModel = require('../models/ligneOrdonnanceModel');

class LigneOrdonnanceController {
  async create(req, res) {
    try {
      console.log('POST /api/ligne-ordonnance - Début');
      console.log('Données reçues:', req.body);

      const { id_ordonnance, id_medicament, quantite_prescrite } = req.body;
      if (!id_ordonnance || !id_medicament || !quantite_prescrite) {
        return res.status(400).json({
          success: false,
          message: 'Les champs id_ordonnance, id_medicament et quantite_prescrite sont obligatoires'
        });
      }

      if (quantite_prescrite <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La quantité prescrite doit être supérieure à 0'
        });
      }

      const newLigne = await LigneOrdonnanceModel.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Ligne d\'ordonnance créée avec succès',
        data: newLigne
      });
    } catch (err) {
      console.error('Erreur création ligne ordonnance:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la ligne d\'ordonnance',
        error: err.message
      });
    }
  }

  async getById(req, res) {
    try {
      const id = req.params.id;

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de la ligne invalide' 
        });
      }

      const ligne = await LigneOrdonnanceModel.getById(id);

      if (!ligne) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ligne d\'ordonnance non trouvée' 
        });
      }

      res.json({
        success: true,
        message: 'Ligne d\'ordonnance récupérée avec succès',
        data: ligne
      });
    } catch (err) {
      console.error('Erreur récupération ligne ordonnance:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la ligne d\'ordonnance',
        error: err.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const lignes = await LigneOrdonnanceModel.getAll();
      
      res.json({
        success: true,
        message: 'Lignes d\'ordonnance récupérées avec succès',
        data: lignes,
        count: lignes.length
      });
    } catch (err) {
      console.error('Erreur récupération lignes ordonnance:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des lignes d\'ordonnance',
        error: err.message
      });
    }
  }

  async getByOrdonnanceId(req, res) {
    try {
      const id_ordonnance = req.params.id_ordonnance;

      if (!id_ordonnance || isNaN(id_ordonnance)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de l\'ordonnance invalide' 
        });
      }

      const lignes = await LigneOrdonnanceModel.getByOrdonnanceId(id_ordonnance);

      res.json({
        success: true,
        message: 'Lignes de l\'ordonnance récupérées avec succès',
        data: lignes,
        count: lignes.length
      });
    } catch (err) {
      console.error('Erreur récupération lignes par ordonnance:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des lignes de cette ordonnance',
        error: err.message
      });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de la ligne invalide' 
        });
      }

      const updatedLigne = await LigneOrdonnanceModel.update(id, req.body);

      if (!updatedLigne) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ligne d\'ordonnance non trouvée' 
        });
      }

      res.json({
        success: true,
        message: 'Ligne d\'ordonnance mise à jour avec succès',
        data: updatedLigne
      });
    } catch (err) {
      console.error('Erreur mise à jour ligne ordonnance:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la ligne d\'ordonnance',
        error: err.message
      });
    }
  }

  async updateStatut(req, res) {
    try {
      const id = req.params.id;
      const { statut, quantite_delivree, date_delivrance } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de la ligne invalide' 
        });
      }

      if (!statut) {
        return res.status(400).json({ 
          success: false, 
          message: 'Le statut est obligatoire' 
        });
      }

      const statutsValides = ['prescrit', 'en_preparation', 'delivre', 'partiel', 'annule'];
      if (!statutsValides.includes(statut)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Statut invalide' 
        });
      }

      const updated = await LigneOrdonnanceModel.updateStatut(
        id, 
        statut, 
        quantite_delivree, 
        date_delivrance
      );

      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ligne d\'ordonnance non trouvée' 
        });
      }

      res.json({
        success: true,
        message: 'Statut de la ligne mis à jour avec succès',
        data: { id_ligne: id, statut, quantite_delivree, date_delivrance }
      });
    } catch (err) {
      console.error('Erreur mise à jour statut ligne:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du statut de la ligne',
        error: err.message
      });
    }
  }

  async updateQuantiteDelivree(req, res) {
    try {
      const id = req.params.id;
      const { quantite_delivree, date_delivrance } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de la ligne invalide' 
        });
      }

      if (quantite_delivree === undefined || quantite_delivree === null) {
        return res.status(400).json({ 
          success: false, 
          message: 'La quantité délivrée est obligatoire' 
        });
      }

      if (quantite_delivree < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'La quantité délivrée ne peut pas être négative' 
        });
      }

      const updated = await LigneOrdonnanceModel.updateQuantiteDelivree(
        id, 
        quantite_delivree, 
        date_delivrance
      );

      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ligne d\'ordonnance non trouvée' 
        });
      }

      res.json({
        success: true,
        message: 'Quantité délivrée mise à jour avec succès',
        data: { id_ligne: id, quantite_delivree, date_delivrance }
      });
    } catch (err) {
      console.error('Erreur mise à jour quantité délivrée:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la quantité délivrée',
        error: err.message
      });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de la ligne invalide' 
        });
      }

      const deleted = await LigneOrdonnanceModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ligne d\'ordonnance non trouvée' 
        });
      }

      res.json({
        success: true,
        message: 'Ligne d\'ordonnance supprimée avec succès'
      });
    } catch (err) {
      console.error('Erreur suppression ligne ordonnance:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la ligne d\'ordonnance',
        error: err.message
      });
    }
  }

  async deleteByOrdonnance(req, res) {
    try {
      const id_ordonnance = req.params.id_ordonnance;

      if (!id_ordonnance || isNaN(id_ordonnance)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de l\'ordonnance invalide' 
        });
      }

      const deleted = await LigneOrdonnanceModel.deleteByOrdonnance(id_ordonnance);

      res.json({
        success: true,
        message: deleted
          ? 'Toutes les lignes de cette ordonnance ont été supprimées'
          : 'Aucune ligne trouvée pour cette ordonnance'
      });
    } catch (err) {
      console.error('Erreur suppression lignes par ordonnance:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression des lignes de cette ordonnance',
        error: err.message
      });
    }
  }

  async getByStatut(req, res) {
    try {
      const { statut } = req.params;

      const statutsValides = ['prescrit', 'en_preparation', 'delivre', 'partiel', 'annule'];
      if (!statutsValides.includes(statut)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Statut invalide' 
        });
      }

      const lignes = await LigneOrdonnanceModel.getByStatut(statut);

      res.json({
        success: true,
        message: `Lignes avec statut "${statut}" récupérées avec succès`,
        data: lignes,
        count: lignes.length
      });
    } catch (err) {
      console.error('Erreur récupération lignes par statut:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des lignes par statut',
        error: err.message
      });
    }
  }

  async getEnAttenteDelivrance(req, res) {
    try {
      const lignes = await LigneOrdonnanceModel.getEnAttenteDelivrance();

      res.json({
        success: true,
        message: 'Lignes en attente de délivrance récupérées avec succès',
        data: lignes,
        count: lignes.length
      });
    } catch (err) {
      console.error('Erreur récupération lignes en attente:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des lignes en attente de délivrance',
        error: err.message
      });
    }
  }

  async verifierStock(req, res) {
    try {
      const id = req.params.id;

      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de la ligne invalide' 
        });
      }

      const stockInfo = await LigneOrdonnanceModel.verifierStock(id);

      if (!stockInfo) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ligne d\'ordonnance non trouvée' 
        });
      }

      res.json({
        success: true,
        message: 'Information stock récupérée avec succès',
        data: stockInfo
      });
    } catch (err) {
      console.error('Erreur vérification stock:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du stock',
        error: err.message
      });
    }
  }
  
  async getTotalOrdonnance(req, res) {
    try {
      const id_ordonnance = req.params.id_ordonnance;

      if (!id_ordonnance || isNaN(id_ordonnance)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de l\'ordonnance invalide' 
        });
      }

      const total = await LigneOrdonnanceModel.getTotalOrdonnance(id_ordonnance);

      res.json({
        success: true,
        message: 'Total de l\'ordonnance calculé avec succès',
        data: total
      });
    } catch (err) {
      console.error('Erreur calcul total ordonnance:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du calcul du total de l\'ordonnance',
        error: err.message
      });
    }
  }
}

module.exports = new LigneOrdonnanceController();