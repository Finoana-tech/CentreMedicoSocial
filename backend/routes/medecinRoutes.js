// routes/medecinRoutes.js
const express = require('express');
const router = express.Router();
const MedecinController = require('../controllers/medecinController');

// Routes spéciales à mettre avant les routes avec paramètre :id
router.get('/search', MedecinController.search);

// Nouvelles routes pour la disponibilité
router.get('/disponibilite/:disponibilite', MedecinController.getByDisponibilite);
router.patch('/:id/disponibilite', MedecinController.updateDisponibilite);

// Routes CRUD classiques
router.get('/', MedecinController.getAll);
router.get('/:id', MedecinController.getById);
router.post('/', MedecinController.create);
router.put('/:id', MedecinController.update);
router.delete('/:id', MedecinController.delete);

module.exports = router;