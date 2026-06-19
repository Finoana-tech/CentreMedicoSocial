const express = require('express');
const router = express.Router();
const OrdonnanceController = require('../controllers/ordonnanceController');

router.get('/search', OrdonnanceController.search);
router.get('/urgentes', OrdonnanceController.getOrdonnancesUrgentes);
router.get('/recentes', OrdonnanceController.getRecentPrescriptions);
router.get('/stats/statut', OrdonnanceController.getStatsByStatut);
router.get('/stats/mois', OrdonnanceController.countOrdonnancesThisMonth);

router.get('/', OrdonnanceController.getAll);
router.post('/', OrdonnanceController.create);

router.get('/:id/details', OrdonnanceController.getDetailsById);
router.get('/:id/renouvellements-restants', OrdonnanceController.getRenouvellementsRestants);
router.get('/:id/validite', OrdonnanceController.estValide);
router.post('/:id/export-pdf', OrdonnanceController.exportToPDF);

router.get('/:id', OrdonnanceController.getById);
router.put('/:id', OrdonnanceController.update);
router.delete('/:id', OrdonnanceController.delete);

router.patch('/:id/valider', OrdonnanceController.valider);
router.patch('/:id/preparation', OrdonnanceController.marquerEnPreparation);
router.patch('/:id/delivrer', OrdonnanceController.delivrer);
router.patch('/:id/annuler', OrdonnanceController.annuler);

router.patch('/:id/renouveler', OrdonnanceController.utiliserRenouvellement);
router.post('/:id/renouveler-copie', OrdonnanceController.renouvelerOrdonnance);

module.exports = router;