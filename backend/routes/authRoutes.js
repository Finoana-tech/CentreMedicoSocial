// 📁 routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const authController = new AuthController();

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/register', authenticateToken, requireRole(['admin']), authController.register);

module.exports = router;