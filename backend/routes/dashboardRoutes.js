const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');

const logRoute = (req, res, next) => {
  console.log(` ${req.method} ${req.originalUrl}`);
  next();
};

router.use(logRoute);
router.get('/stats', DashboardController.getStats);
router.get('/rendezvous/aujourdhui', DashboardController.getTodayAppointments);
router.get('/ordonnances/recentes', DashboardController.getRecentPrescriptions);

router.use('*', (req, res) => {
  console.warn(`Route dashboard non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route dashboard non trouvée',
    availableRoutes: [
      'GET /api/dashboard/stats',
      'GET /api/dashboard/rendezvous/aujourdhui', 
      'GET /api/dashboard/ordonnances/recentes'
    ]
  });
});

module.exports = router;