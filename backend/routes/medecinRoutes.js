const express = require('express');
const router = express.Router();
const MedecinController = require('../controllers/medecinController');

router.get('/search', MedecinController.search);
router.get('/disponibilite/:disponibilite', MedecinController.getByDisponibilite);
router.patch('/:id/disponibilite', MedecinController.updateDisponibilite);

// Routes CRUD classiques
router.get('/', MedecinController.getAll);
router.get('/:id', MedecinController.getById);
router.post('/', MedecinController.create);
router.put('/:id', MedecinController.update);
router.delete('/:id', MedecinController.delete);

module.exports = router;