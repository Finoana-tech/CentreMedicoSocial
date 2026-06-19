const express = require('express');
const router = express.Router();
const MedicamentController = require('../controllers/medicamentController');

router.get('/search', MedicamentController.search);
router.get('/stock/critique', MedicamentController.getStockCritique); 
router.get('/stats', MedicamentController.getStats);

// Routes CRUD classiques
router.get('/', MedicamentController.getAll);       
router.get('/:id', MedicamentController.getById);  
router.post('/', MedicamentController.create);      
router.put('/:id', MedicamentController.update);    
router.delete('/:id', MedicamentController.delete); 

router.get('/classe/:classe', MedicamentController.getByClasseTherapeutique); 
router.patch('/:id/stock', MedicamentController.updateStock); 

module.exports = router;