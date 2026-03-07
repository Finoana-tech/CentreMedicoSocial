const MedecinModel = require('../models/medecinModel');

class MedecinController {
  async create(req, res) {
    try {
      console.log('POST /api/medecin - Début');
      console.log('Données reçues:', req.body);

      const { nom, prenom, disponibilite } = req.body;
      if (!nom || !prenom) {
        return res.status(400).json({
          success: false,
          message: 'Les champs nom et prenom sont obligatoires'
        });
      }

     const disponibilitesValides = ['disponible', 'en_consultation', 'pause', 'chirurgie', 'hors_service'];
      if (disponibilite && !disponibilitesValides.includes(disponibilite)) {
        return res.status(400).json({
          success: false,
          message: 'Statut de disponibilité invalide'
        });
      }

      console.log('Validation des données réussie');
      const newMedecin = await MedecinModel.create(req.body);
      console.log('Médecin créé avec succès:', newMedecin);

      res.status(201).json({
        success: true,
        message: 'Médecin créé avec succès',
        data: newMedecin
      });

    } catch (err) {
      console.error('Erreur création médecin:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du médecin',
        error: err.message
      });
    }
  }

  async getAll(req, res) {
    try {
      console.log('GET /api/medecin - Début');
      const medecins = await MedecinModel.getAll();
      console.log('Médecins récupérés:', medecins.length);

      res.json({
        success: true,
        message: 'Médecins récupérés avec succès',
        data: medecins,
        count: medecins.length
      });
    } catch (err) {
      console.error('Erreur récupération médecins:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médecins',
        error: err.message
      });
    }
  }

  // Obtenir un médecin par ID
  async getById(req, res) {
    try {
      const id = req.params.id;
      console.log(`GET /api/medecin/${id} - Début`);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du médecin invalide'
        });
      }

      const medecin = await MedecinModel.getById(id);

      if (!medecin) {
        return res.status(404).json({
          success: false,
          message: 'Médecin non trouvé'
        });
      }

      console.log('Médecin récupéré:', medecin);
      res.json({
        success: true,
        message: 'Médecin récupéré avec succès',
        data: medecin
      });

    } catch (err) {
      console.error('Erreur récupération médecin:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du médecin',
        error: err.message
      });
    }
  }

  // Mettre à jour un médecin
  async update(req, res) {
    try {
      const id = req.params.id;
      console.log(`PUT /api/medecin/${id} - Début`);
      console.log('Données reçues:', req.body);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du médecin invalide'
        });
      }

      const { nom, prenom, disponibilite } = req.body;

      // Validation des champs obligatoires
      if (!nom || !prenom) {
        return res.status(400).json({
          success: false,
          message: 'Les champs nom et prenom sont obligatoires'
        });
      }

      // Validation de la disponibilité si fournie
      const disponibilitesValides = ['disponible', 'en_consultation', 'pause', 'chirurgie', 'hors_service'];
      if (disponibilite && !disponibilitesValides.includes(disponibilite)) {
        return res.status(400).json({
          success: false,
          message: 'Statut de disponibilité invalide'
        });
      }

      const updatedMedecin = await MedecinModel.update(id, req.body);

      if (!updatedMedecin) {
        return res.status(404).json({
          success: false,
          message: 'Médecin non trouvé'
        });
      }

      console.log('Médecin mis à jour:', updatedMedecin);
      res.json({
        success: true,
        message: 'Médecin mis à jour avec succès',
        data: updatedMedecin
      });

    } catch (err) {
      console.error('Erreur mise à jour médecin:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du médecin',
        error: err.message
      });
    }
  }

  // Supprimer un médecin
  async delete(req, res) {
    try {
      const id = req.params.id;
      console.log(`DELETE /api/medecin/${id} - Début`);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du médecin invalide'
        });
      }

      const deleted = await MedecinModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Médecin non trouvé'
        });
      }

      console.log('Médecin supprimé avec succès');
      res.json({
        success: true,
        message: 'Médecin supprimé avec succès'
      });

    } catch (err) {
      console.error('Erreur suppression médecin:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du médecin',
        error: err.message
      });
    }
  }

  // Recherche de médecins
  async search(req, res) {
    try {
      const { q } = req.query;
      console.log(`GET /api/medecin/search?q=${q} - Début`);

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Le terme de recherche doit contenir au moins 2 caractères'
        });
      }

      const medecins = await MedecinModel.search(q.trim());

      res.json({
        success: true,
        message: 'Recherche effectuée avec succès',
        data: medecins,
        count: medecins.length
      });

    } catch (err) {
      console.error('Erreur recherche médecins:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche',
        error: err.message
      });
    }
  }

  // Mettre à jour la disponibilité d'un médecin
  async updateDisponibilite(req, res) {
    try {
      const id = req.params.id;
      const { disponibilite } = req.body;
      
      console.log(`PATCH /api/medecin/${id}/disponibilite - Début`);
      console.log('Données reçues:', { disponibilite });

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du médecin invalide'
        });
      }

      if (!disponibilite) {
        return res.status(400).json({
          success: false,
          message: 'Le champ disponibilite est obligatoire'
        });
      }

      // Validation de la disponibilité
      const disponibilitesValides = ['disponible', 'en_consultation', 'pause', 'chirurgie', 'hors_service'];
      if (!disponibilitesValides.includes(disponibilite)) {
        return res.status(400).json({
          success: false,
          message: 'Statut de disponibilité invalide'
        });
      }

      const updated = await MedecinModel.updateDisponibilite(id, disponibilite);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Médecin non trouvé'
        });
      }

      console.log('Disponibilité mise à jour avec succès');
      res.json({
        success: true,
        message: 'Disponibilité mise à jour avec succès',
        data: { id_medecin: id, disponibilite }
      });

    } catch (err) {
      console.error('Erreur mise à jour disponibilité:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la disponibilité',
        error: err.message
      });
    }
  }

  // Obtenir les médecins par disponibilité
  async getByDisponibilite(req, res) {
    try {
      const { disponibilite } = req.params;
      console.log(`GET /api/medecin/disponibilite/${disponibilite} - Début`);

      if (!disponibilite) {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre disponibilite est obligatoire'
        });
      }

      // Validation de la disponibilité
      const disponibilitesValides = ['disponible', 'en_consultation', 'pause', 'chirurgie', 'hors_service'];
      if (!disponibilitesValides.includes(disponibilite)) {
        return res.status(400).json({
          success: false,
          message: 'Statut de disponibilité invalide'
        });
      }

      const medecins = await MedecinModel.getByDisponibilite(disponibilite);

      res.json({
        success: true,
        message: `Médecins ${disponibilite} récupérés avec succès`,
        data: medecins,
        count: medecins.length
      });

    } catch (err) {
      console.error('Erreur récupération médecins par disponibilité:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des médecins',
        error: err.message
      });
    }
  }
}

module.exports = new MedecinController();