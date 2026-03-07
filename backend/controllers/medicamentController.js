// controllers/MedicamentController.js
const MedicamentModel = require('../models/medicamentModel');

class MedicamentController {
  //  Créer un nouveau médicament
  async create(req, res) {
    try {
      console.log(' POST /api/medicament - Début');
      console.log(' Données reçues:', req.body);

      const { nom_commercial } = req.body;

      // Validation des champs obligatoires
      if (!nom_commercial) {
        return res.status(400).json({
          success: false,
          message: 'Le champ nom_commercial est obligatoire'
        });
      }

      console.log(' Validation des données réussie');
      const newMedicament = await MedicamentModel.create(req.body);
      console.log(' Médicament créé avec succès:', newMedicament);

      res.status(201).json({
        success: true,
        message: 'Médicament créé avec succès',
        data: newMedicament
      });

    } catch (err) {
      console.error(' Erreur création médicament:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du médicament',
        error: err.message
      });
    }
  }

  //  Récupérer tous les médicaments
  async getAll(req, res) {
    try {
      console.log('🔍 GET /api/medicament - Début');
      const medicaments = await MedicamentModel.getAll();
      console.log(' Médicaments récupérés:', medicaments.length);

      res.json({
        success: true,
        message: 'Médicaments récupérés avec succès',
        data: medicaments,
        count: medicaments.length
      });
    } catch (err) {
      console.error(' Erreur récupération médicaments:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médicaments',
        error: err.message
      });
    }
  }

  //  Récupérer un médicament par ID
  async getById(req, res) {
    try {
      const id = req.params.id;
      console.log(` GET /api/medicament/${id} - Début`);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du médicament invalide'
        });
      }

      const medicament = await MedicamentModel.getById(id);

      if (!medicament) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }

      console.log(' Médicament récupéré:', medicament);
      res.json({
        success: true,
        message: 'Médicament récupéré avec succès',
        data: medicament
      });

    } catch (err) {
      console.error(' Erreur récupération médicament:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du médicament',
        error: err.message
      });
    }
  }

  //  Mettre à jour un médicament
  async update(req, res) {
    try {
      const id = req.params.id;
      console.log(` PUT /api/medicament/${id} - Début`);
      console.log(' Données reçues:', req.body);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du médicament invalide'
        });
      }

      const { nom_commercial } = req.body;
      if (!nom_commercial) {
        return res.status(400).json({
          success: false,
          message: 'Le champ nom_commercial est obligatoire'
        });
      }

      const updatedMedicament = await MedicamentModel.update(id, req.body);

      if (!updatedMedicament) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }

      console.log(' Médicament mis à jour:', updatedMedicament);
      res.json({
        success: true,
        message: 'Médicament mis à jour avec succès',
        data: updatedMedicament
      });

    } catch (err) {
      console.error(' Erreur mise à jour médicament:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du médicament',
        error: err.message
      });
    }
  }

  //  Supprimer un médicament
  async delete(req, res) {
    try {
      const id = req.params.id;
      console.log(` DELETE /api/medicament/${id} - Début`);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du médicament invalide'
        });
      }

      const deleted = await MedicamentModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }

      console.log(' Médicament supprimé avec succès');
      res.json({
        success: true,
        message: 'Médicament supprimé avec succès'
      });

    } catch (err) {
      console.error(' Erreur suppression médicament:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du médicament',
        error: err.message
      });
    }
  }

  //  Recherche de médicaments
  async search(req, res) {
    try {
      const { q } = req.query;
      console.log(` GET /api/medicament/search?q=${q} - Début`);

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Le terme de recherche doit contenir au moins 2 caractères'
        });
      }

      const medicaments = await MedicamentModel.search(q.trim());

      res.json({
        success: true,
        message: 'Recherche effectuée avec succès',
        data: medicaments,
        count: medicaments.length
      });

    } catch (err) {
      console.error(' Erreur recherche médicaments:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche de médicaments',
        error: err.message
      });
    }
  }

  //  NOUVELLE MÉTHODE: Récupérer les médicaments avec stock critique
  async getStockCritique(req, res) {
    try {
      console.log(' GET /api/medicament/stock/critique - Début');
      const medicaments = await MedicamentModel.getStockCritique();
      console.log(' Médicaments en stock critique:', medicaments.length);

      res.json({
        success: true,
        message: 'Médicaments en stock critique récupérés avec succès',
        data: medicaments,
        count: medicaments.length
      });
    } catch (err) {
      console.error(' Erreur récupération stock critique:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du stock critique',
        error: err.message
      });
    }
  }

  //  NOUVELLE MÉTHODE: Récupérer les médicaments par classe thérapeutique
  async getByClasseTherapeutique(req, res) {
    try {
      const { classe } = req.params;
      console.log(` GET /api/medicament/classe/${classe} - Début`);

      if (!classe) {
        return res.status(400).json({
          success: false,
          message: 'La classe thérapeutique est requise'
        });
      }

      const medicaments = await MedicamentModel.getByClasseTherapeutique(classe);

      res.json({
        success: true,
        message: `Médicaments de la classe ${classe} récupérés avec succès`,
        data: medicaments,
        count: medicaments.length
      });

    } catch (err) {
      console.error(' Erreur récupération par classe thérapeutique:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médicaments par classe thérapeutique',
        error: err.message
      });
    }
  }

  //  NOUVELLE MÉTHODE: Mettre à jour le stock d'un médicament
  async updateStock(req, res) {
    try {
      const id = req.params.id;
      const { stock_actuel } = req.body;
      console.log(` PATCH /api/medicament/${id}/stock - Début`);
      console.log(' Nouveau stock:', stock_actuel);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du médicament invalide'
        });
      }

      if (stock_actuel === undefined || stock_actuel === null || stock_actuel < 0) {
        return res.status(400).json({
          success: false,
          message: 'La valeur du stock est invalide'
        });
      }

      const updated = await MedicamentModel.updateStock(id, stock_actuel);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Médicament non trouvé'
        });
      }

      console.log(' Stock mis à jour avec succès');
      res.json({
        success: true,
        message: 'Stock mis à jour avec succès',
        data: { id_medicament: id, stock_actuel }
      });

    } catch (err) {
      console.error(' Erreur mise à jour stock:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du stock',
        error: err.message
      });
    }
  }

  //  NOUVELLE MÉTHODE: Récupérer les statistiques des médicaments
  async getStats(req, res) {
    try {
      console.log(' GET /api/medicament/stats - Début');
      
      const allMedicaments = await MedicamentModel.getAll();
      
      // Calcul des statistiques
      const stats = {
        total: allMedicaments.length,
        stock_critique: allMedicaments.filter(m => m.stock_actuel <= m.stock_minimum).length,
        prescription_restreinte: allMedicaments.filter(m => m.prescription_restreinte).length,
        par_classe: {},
        valeur_stock_total: 0
      };

      // Calcul par classe thérapeutique et valeur du stock
      allMedicaments.forEach(medicament => {
        // Par classe
        if (medicament.classe_therapeutique) {
          stats.par_classe[medicament.classe_therapeutique] = 
            (stats.par_classe[medicament.classe_therapeutique] || 0) + 1;
        }
        
        // Valeur stock total
        stats.valeur_stock_total += medicament.stock_actuel * medicament.prix_unitaire;
      });

      console.log(' Statistiques calculées:', stats);
      res.json({
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: stats
      });

    } catch (err) {
      console.error(' Erreur récupération statistiques:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: err.message
      });
    }
  }
}

module.exports = new MedicamentController();