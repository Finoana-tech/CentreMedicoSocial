const express = require("express");
const UtilisateurController = require("../controllers/utilisateurController");
const authMiddleware = require("../middleware/auth");
const ValidationMiddleware = require("../middleware/validation");

const router = express.Router();

router.post(
  "/login",
  ValidationMiddleware.validateLogin(),
  UtilisateurController.login
);

router.post(
  "/password/forgot",
  ValidationMiddleware.validateEmail(),
  UtilisateurController.forgotPassword
);

router.post(
  "/password/reset",
  ValidationMiddleware.validateResetPassword(),
  UtilisateurController.resetPassword
);

router.get(
  "/profile",
  authMiddleware.verifyToken,
  UtilisateurController.getProfile
);

// Déconnexion
router.post(
  "/logout",
  authMiddleware.verifyToken,
  UtilisateurController.logout
);

// Vérification du token
router.post(
  "/verify-token",
  authMiddleware.verifyToken,
  UtilisateurController.verifyToken
);

router.post(
  "/register",
  authMiddleware.verifyToken,             
  authMiddleware.requireRole("admin"),    
  ValidationMiddleware.validateCreateUser(),
  UtilisateurController.create           
);

router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("admin"),
  UtilisateurController.list
);

router.patch(
  "/:id/actif",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("admin"),
  ValidationMiddleware.validateUpdateUser(),
  UtilisateurController.toggle
);

router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isOwnerOrAdmin(),
  ValidationMiddleware.validateUpdateProfil(),
  UtilisateurController.update 
);

router.put(
  "/:id/password",
  authMiddleware.verifyToken,
  authMiddleware.isOwnerOrAdmin(),
  ValidationMiddleware.validateUpdatePassword(),
  UtilisateurController.updatePassword
);

module.exports = router;
