// routes/utilisateurs.js
const express = require("express");
const UtilisateurController = require("../controllers/utilisateurController");
const authMiddleware = require("../middleware/auth");
const ValidationMiddleware = require("../middleware/validation");

const router = express.Router();

/*
  ROUTES PUBLIQUES
*/
// Connexion
router.post(
  "/login",
  ValidationMiddleware.validateLogin(),
  UtilisateurController.login
);

/*
  ROUTES MOT DE PASSE OUBLIÉ / RESET
*/
// Demande de réinitialisation
router.post(
  "/password/forgot",
  ValidationMiddleware.validateEmail(),
  UtilisateurController.forgotPassword
);

// Réinitialisation du mot de passe avec token
router.post(
  "/password/reset",
  ValidationMiddleware.validateResetPassword(),
  UtilisateurController.resetPassword
);

/*
  ROUTES PROTÉGÉES (JWT requis)
*/
// Profil de l'utilisateur connecté
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

/*
  ROUTES ADMIN (gestion des utilisateurs)
*/
// Création d'un utilisateur (seul admin peut créer)
router.post(
  "/register",
  authMiddleware.verifyToken,             // ✅ vérifier token
  authMiddleware.requireRole("admin"),    // ✅ seul admin peut créer
  ValidationMiddleware.validateCreateUser(),
  UtilisateurController.create            // ✅ dans le controller on vérifie id_medecin
);

// Liste tous les utilisateurs
router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("admin"),
  UtilisateurController.list
);

// Activer / désactiver un utilisateur
router.patch(
  "/:id/actif",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("admin"),
  ValidationMiddleware.validateUpdateUser(),
  UtilisateurController.toggle
);

/*
  ROUTES POUR LE PROPRE COMPTE (profil & mot de passe)
*/
// Mise à jour du profil
router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isOwnerOrAdmin(),
  ValidationMiddleware.validateUpdateProfil(),
  UtilisateurController.update // ✅ vérifie aussi id_medecin si rôle = medecin
);

// Changement de mot de passe
router.put(
  "/:id/password",
  authMiddleware.verifyToken,
  authMiddleware.isOwnerOrAdmin(),
  ValidationMiddleware.validateUpdatePassword(),
  UtilisateurController.updatePassword
);

module.exports = router;
