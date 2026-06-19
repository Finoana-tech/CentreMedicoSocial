const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patientController');

router.get('/search/all', PatientController.search);
router.get('/stats/statistiques', PatientController.getStats);
router.get('/tuteurs/potentiels', PatientController.getTuteursPotentiels);
router.get('/tuteur/:tuteurId', PatientController.getByTuteur);
router.get('/dernier-rv/liste', PatientController.getPatientsAvecDernierRV);

// Routes CRUD classiques
router.get('/', PatientController.getAll);
router.get('/:id', PatientController.getById);
router.post('/', PatientController.create);
router.put('/:id', PatientController.update);
router.delete('/:id', PatientController.delete);

module.exports = router;
