// routes/medicamentRoutes.js
const express = require('express');
const router = express.Router();
const MedicamentController = require('../controllers/medicamentController');

// ⚡ Routes spéciales à mettre avant celles avec `:id`
router.get('/search', MedicamentController.search); // recherche par nom_commercial, principe_actif, dosage, classe_therapeutique
router.get('/stock/critique', MedicamentController.getStockCritique); // médicaments avec stock critique
router.get('/stats', MedicamentController.getStats); // statistiques des médicaments

// Routes CRUD classiques
router.get('/', MedicamentController.getAll);       // récupérer tous les médicaments
router.get('/:id', MedicamentController.getById);   // récupérer un médicament par ID
router.post('/', MedicamentController.create);      // créer un médicament
router.put('/:id', MedicamentController.update);    // mettre à jour un médicament
router.delete('/:id', MedicamentController.delete); // supprimer un médicament

// ⚡ Nouvelles routes spéciales (à mettre APRÈS les routes avec `:id`)
router.get('/classe/:classe', MedicamentController.getByClasseTherapeutique); // médicaments par classe thérapeutique
router.patch('/:id/stock', MedicamentController.updateStock); // mise à jour du stock

module.exports = router;