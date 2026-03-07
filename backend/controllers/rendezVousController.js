// controllers/RendezVousController.js
const RendezVousModel = require('../models/rendezVousModel');

class RendezVousController {
  // Créer un nouveau rendez-vous
  async create(req, res) {
    try {
      console.log('POST /api/rendezvous - Début');
      console.log('Données reçues:', req.body);

      const { id_patient, id_medecin, date_heure, motif } = req.body;

      // Validation des champs obligatoires
      if (!id_patient || !id_medecin || !date_heure || !motif) {
        return res.status(400).json({
          success: false,
          message: 'Les champs id_patient, id_medecin, date_heure et motif sont obligatoires'
        });
      }

      console.log('Validation des données réussie');
      const newRendezVous = await RendezVousModel.create(req.body);
      console.log('Rendez-vous créé avec succès:', newRendezVous);

      res.status(201).json({
        success: true,
        message: 'Rendez-vous créé avec succès',
        data: newRendezVous
      });

    } catch (err) {
      console.error('Erreur création rendez-vous:', err);
      
      // Gestion spécifique des erreurs de disponibilité
      if (err.message.includes('Médecin actuellement') || 
          err.message.includes('Non disponible') ||
          err.message.includes('Hors des horaires') ||
          err.message.includes('Le centre est fermé') ||
          err.message.includes('déjà un rendez-vous')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du rendez-vous',
        error: err.message
      });
    }
  }

  // Obtenir tous les rendez-vous
  async getAll(req, res) {
    try {
      console.log('GET /api/rendezvous - Début');
      const filters = req.query;
      console.log('Filtres appliqués:', filters);
      
      const rendezvous = await RendezVousModel.getAll(filters);
      console.log('Rendez-vous récupérés:', rendezvous.length);

      res.json({
        success: true,
        message: 'Rendez-vous récupérés avec succès',
        data: rendezvous,
        count: rendezvous.length
      });
    } catch (err) {
      console.error('Erreur récupération rendez-vous:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des rendez-vous',
        error: err.message
      });
    }
  }

  // Obtenir un rendez-vous par ID
  async getById(req, res) {
    try {
      const id = req.params.id;
      console.log(`GET /api/rendezvous/${id} - Début`);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du rendez-vous invalide'
        });
      }

      const rendezvous = await RendezVousModel.getById(id);

      if (!rendezvous) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      console.log('Rendez-vous récupéré:', rendezvous);
      res.json({
        success: true,
        message: 'Rendez-vous récupéré avec succès',
        data: rendezvous
      });

    } catch (err) {
      console.error('Erreur récupération rendez-vous:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du rendez-vous',
        error: err.message
      });
    }
  }

  // Mettre à jour un rendez-vous
  async update(req, res) {
    try {
      const id = req.params.id;
      console.log(`PUT /api/rendezvous/${id} - Début`);
      console.log('Données reçues:', req.body);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du rendez-vous invalide'
        });
      }

      const { id_patient, id_medecin, date_heure, motif } = req.body;

      // Validation des champs obligatoires
      if (!id_patient || !id_medecin || !date_heure || !motif) {
        return res.status(400).json({
          success: false,
          message: 'Les champs id_patient, id_medecin, date_heure et motif sont obligatoires'
        });
      }

      const updatedRendezVous = await RendezVousModel.update(id, req.body);

      if (!updatedRendezVous) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      console.log('Rendez-vous mis à jour:', updatedRendezVous);
      res.json({
        success: true,
        message: 'Rendez-vous mis à jour avec succès',
        data: updatedRendezVous
      });

    } catch (err) {
      console.error('Erreur mise à jour rendez-vous:', err);
      
      // Gestion spécifique des erreurs de disponibilité
      if (err.message.includes('Médecin actuellement') || 
          err.message.includes('Non disponible') || 
          err.message.includes('Nouveau médecin') ||
          err.message.includes('Hors des horaires') ||
          err.message.includes('Le centre est fermé') ||
          err.message.includes('déjà un rendez-vous')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du rendez-vous',
        error: err.message
      });
    }
  }

  // Supprimer un rendez-vous
  async delete(req, res) {
    try {
      const id = req.params.id;
      console.log(`DELETE /api/rendezvous/${id} - Début`);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du rendez-vous invalide'
        });
      }

      const deleted = await RendezVousModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      console.log('Rendez-vous supprimé avec succès');
      res.json({
        success: true,
        message: 'Rendez-vous supprimé avec succès'
      });

    } catch (err) {
      console.error('Erreur suppression rendez-vous:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du rendez-vous',
        error: err.message
      });
    }
  }

  // Recherche de rendez-vous
  async search(req, res) {
    try {
      const { q } = req.query;
      console.log(`GET /api/rendezvous/search?q=${q} - Début`);

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Le terme de recherche doit contenir au moins 2 caractères'
        });
      }

      const rendezvous = await RendezVousModel.search(q.trim());

      res.json({
        success: true,
        message: 'Recherche effectuée avec succès',
        data: rendezvous,
        count: rendezvous.length
      });

    } catch (err) {
      console.error('Erreur recherche rendez-vous:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche',
        error: err.message
      });
    }
  }

  // Annuler un rendez-vous
  async annuler(req, res) {
    try {
      const id = req.params.id;
      const { raison } = req.body;
      
      console.log(`POST /api/rendezvous/${id}/annuler - Début`);
      console.log('Raison d annulation:', raison);

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du rendez-vous invalide'
        });
      }

      const annule = await RendezVousModel.annuler(id, raison);

      if (!annule) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      console.log('Rendez-vous annulé avec succès');
      res.json({
        success: true,
        message: 'Rendez-vous annulé avec succès'
      });

    } catch (err) {
      console.error('Erreur annulation rendez-vous:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l annulation du rendez-vous',
        error: err.message
      });
    }
  }

  // controllers/RendezVousController.js - checkAvailability (section corrigée)
async checkAvailability(req, res) {
  try {
    const { id_medecin, date_heure, duree, excludeRdvId } = req.body;
    console.log('POST /api/rendez-vous/check-availability - Début');
    console.log('Paramètres:', { id_medecin, date_heure, duree, excludeRdvId });

    if (!id_medecin || !date_heure) {
      return res.status(400).json({
        success: false,
        message: 'Les champs id_medecin et date_heure sont obligatoires'
      });
    }

    // Vérifier que l'ID médecin est valide - CORRECTION
    let medecinId;
    try {
      medecinId = parseInt(id_medecin);
      if (isNaN(medecinId) || medecinId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID du médecin invalide'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'ID du médecin invalide'
      });
    }

    const availability = await RendezVousModel.checkAvailability(
      medecinId, // Utiliser l'ID converti
      date_heure, 
      duree || 30,
      excludeRdvId || null
    );

    res.json({
      success: true,
      message: availability.disponible ? 'Créneau disponible' : 'Créneau non disponible',
      data: availability
    });

  } catch (err) {
    console.error('Erreur vérification disponibilité:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de disponibilité',
      error: err.message
    });
  }
}

  // SUPPRIMÉ : getAvailableSlots - Plus de génération de créneaux
  async getAvailableSlots(req, res) {
    try {
      return res.status(410).json({
        success: false,
        message: 'Cette fonctionnalité a été supprimée. Utilisez checkAvailability pour vérifier la disponibilité d\'un créneau spécifique.'
      });
    } catch (err) {
      console.error('Erreur récupération créneaux:', err);
      res.status(500).json({
        success: false,
        message: 'Fonctionnalité supprimée',
        error: err.message
      });
    }
  }

  // Obtenir les statistiques du dashboard
  async getDashboardStats(req, res) {
    try {
      console.log('GET /api/rendezvous/dashboard/stats - Début');

      const stats = await RendezVousModel.getDashboardStats();

      res.json({
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: stats
      });

    } catch (err) {
      console.error('Erreur récupération statistiques:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: err.message
      });
    }
  }

  // Obtenir les rendez-vous du jour
  async getTodayAppointments(req, res) {
    try {
      console.log('GET /api/rendezvous/today - Début');

      const appointments = await RendezVousModel.getTodayAppointments();

      res.json({
        success: true,
        message: 'Rendez-vous du jour récupérés avec succès',
        data: appointments,
        count: appointments.length
      });

    } catch (err) {
      console.error('Erreur récupération rendez-vous du jour:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des rendez-vous du jour',
        error: err.message
      });
    }
  }

  // NOUVELLE MÉTHODE : Vérification rapide de disponibilité (pour le frontend)
  async quickCheck(req, res) {
    try {
      const { id_medecin, date, heure } = req.query;
      console.log('GET /api/rendezvous/quick-check - Début');
      console.log('Paramètres:', { id_medecin, date, heure });

      if (!id_medecin || !date || !heure) {
        return res.status(400).json({
          success: false,
          message: 'Les paramètres id_medecin, date et heure sont obligatoires'
        });
      }

      // Formater la date_heure complète
      const date_heure = `${date}T${heure}:00`;
      
      const availability = await RendezVousModel.checkAvailability(
        id_medecin, 
        date_heure, 
        30, // Durée par défaut
        null
      );

      res.json({
        success: true,
        message: availability.disponible ? 'Disponible' : 'Non disponible',
        data: {
          disponible: availability.disponible,
          raison: availability.raison || null,
          date_heure: date_heure
        }
      });

    } catch (err) {
      console.error('Erreur vérification rapide:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification rapide',
        error: err.message
      });
    }
  }

  // SUPPRIMÉES : Méthodes obsolètes
  async declarerOccupation(req, res) {
    return res.status(410).json({
      success: false,
      message: 'Cette fonctionnalité a été supprimée. La disponibilité est maintenant gérée automatiquement.'
    });
  }

  async terminerOccupation(req, res) {
    return res.status(410).json({
      success: false,
      message: 'Cette fonctionnalité a été supprimée. La disponibilité est maintenant gérée automatiquement.'
    });
  }

  async getStatutMedecins(req, res) {
    return res.status(410).json({
      success: false,
      message: 'Cette fonctionnalité doit être gérée par le contrôleur Médecin. Utilisez /api/medecins pour obtenir les statuts.'
    });
  }
}

module.exports = new RendezVousController();