// routes/rendezvousRoutes.js
const express = require('express');
const router = express.Router();
const RendezVousController = require('../controllers/rendezVousController');

// Routes de recherche et vérification à mettre avant les routes avec paramètre `:id`
router.get('/search', RendezVousController.search);
router.get('/quick-check', RendezVousController.quickCheck);

// Routes CRUD classiques
router.get('/', RendezVousController.getAll);
router.get('/:id', RendezVousController.getById);
router.post('/', RendezVousController.create);
router.put('/:id', RendezVousController.update);
router.delete('/:id', RendezVousController.delete);

// Routes spécifiques aux fonctionnalités rendez-vous
router.get('/dashboard/stats', RendezVousController.getDashboardStats);
router.get('/today', RendezVousController.getTodayAppointments);
router.post('/check-availability', RendezVousController.checkAvailability);
router.post('/:id/annuler', RendezVousController.annuler);

// ============================================================================
// ROUTES OBSOLÈTES - CONSERVER POUR LA RÉTROCOMPATIBILITÉ MAIS RETOURNER DES ERREURS
// ============================================================================

// Ancienne route des créneaux disponibles (supprimée)
router.get('/available-slots', RendezVousController.getAvailableSlots);

// Anciennes routes de gestion d'occupation (supprimées)
router.get('/statut-medecins', RendezVousController.getStatutMedecins);
router.post('/occupation', RendezVousController.declarerOccupation);
router.post('/occupation/:id/terminer', RendezVousController.terminerOccupation);

module.exports = router;