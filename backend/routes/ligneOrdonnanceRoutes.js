const express = require('express');
const router = express.Router();
const LigneOrdonnanceController = require('../controllers/ligneOrdonnanceController');

router.get('/statut/:statut', LigneOrdonnanceController.getByStatut); 
router.get('/attente-delivrance', LigneOrdonnanceController.getEnAttenteDelivrance); 
router.get('/ordonnance/:id_ordonnance/total', LigneOrdonnanceController.getTotalOrdonnance); 

// Routes CRUD classiques
router.get('/', LigneOrdonnanceController.getAll); 
router.get('/:id', LigneOrdonnanceController.getById); 
router.post('/', LigneOrdonnanceController.create); 
router.put('/:id', LigneOrdonnanceController.update); 
router.delete('/:id', LigneOrdonnanceController.delete); 

router.get('/ordonnance/:id_ordonnance', LigneOrdonnanceController.getByOrdonnanceId);
router.delete('/ordonnance/:id_ordonnance', LigneOrdonnanceController.deleteByOrdonnance); 
router.patch('/:id/statut', LigneOrdonnanceController.updateStatut); 
router.patch('/:id/quantite-delivree', LigneOrdonnanceController.updateQuantiteDelivree); 
router.get('/:id/verifier-stock', LigneOrdonnanceController.verifierStock); 

module.exports = router;