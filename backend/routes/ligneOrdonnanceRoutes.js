const express = require('express');
const router = express.Router();
const LigneOrdonnanceController = require('../controllers/ligneOrdonnanceController');

// ⚡ Routes spéciales à mettre avant celles avec `:id`
router.get('/statut/:statut', LigneOrdonnanceController.getByStatut); // Lignes par statut
router.get('/attente-delivrance', LigneOrdonnanceController.getEnAttenteDelivrance); // Lignes en attente
router.get('/ordonnance/:id_ordonnance/total', LigneOrdonnanceController.getTotalOrdonnance); // Total d'une ordonnance

// Routes CRUD classiques
router.get('/', LigneOrdonnanceController.getAll); // Toutes les lignes
router.get('/:id', LigneOrdonnanceController.getById); // Ligne par ID
router.post('/', LigneOrdonnanceController.create); // Créer une ligne
router.put('/:id', LigneOrdonnanceController.update); // Modifier une ligne
router.delete('/:id', LigneOrdonnanceController.delete); // Supprimer une ligne

// ⚡ Nouvelles routes spéciales (à mettre APRÈS les routes avec `:id`)
router.get('/ordonnance/:id_ordonnance', LigneOrdonnanceController.getByOrdonnanceId); // Lignes d'une ordonnance
router.delete('/ordonnance/:id_ordonnance', LigneOrdonnanceController.deleteByOrdonnance); // Supprimer toutes les lignes d'une ordonnance
router.patch('/:id/statut', LigneOrdonnanceController.updateStatut); // Mettre à jour le statut
router.patch('/:id/quantite-delivree', LigneOrdonnanceController.updateQuantiteDelivree); // Mettre à jour quantité délivrée
router.get('/:id/verifier-stock', LigneOrdonnanceController.verifierStock); // Vérifier le stock

module.exports = router;