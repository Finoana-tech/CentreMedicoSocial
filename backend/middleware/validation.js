const { body, param, query } = require("express-validator");

class ValidationMiddleware {
  validateLogin() {
    return [
      body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Email invalide"),
      body("mot_de_passe")
        .isLength({ min: 1 })
        .withMessage("Le mot de passe est requis")
    ];
  }
  
  validateCreateUser() {
    return [
      body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Email invalide"),
      body("mot_de_passe")
        .isLength({ min: 6 })
        .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
      body("role")
        .isIn(["medecin", "admin", "assistant", "pharmacien"])
        .withMessage("Rôle invalide"),
      body("id_medecin")
        .optional()
        .isInt({ min: 1 })
        .withMessage("ID médecin invalide"),
      body("actif")
        .optional()
        .isBoolean()
        .withMessage("Le statut actif doit être un booléen")
    ];
  }

  // Validation de la mise à jour d'utilisateur
  validateUpdateUser() {
    return [
      param("id")
        .isInt({ min: 1 })
        .withMessage("ID utilisateur invalide"),
      body("email")
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage("Email invalide"),
      body("role")
        .optional()
        .isIn(["medecin", "admin", "assistant", "pharmacien"])
        .withMessage("Rôle invalide"),
      body("id_medecin")
        .optional()
        .isInt({ min: 1 })
        .withMessage("ID médecin invalide"),
      body("actif")
        .optional()
        .isBoolean()
        .withMessage("Le statut actif doit être un booléen")
    ];
  }

  validateUpdateProfil() {
    return [
      body("email")
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage("Email invalide"),

      body("role")
        .optional()
        .isIn(["medecin", "admin", "assistant", "pharmacien"])
        .withMessage("Rôle invalide"),

      body("actif")
        .optional()
        .isBoolean()
        .withMessage("Le statut actif doit être un booléen"),

      body("id_medecin")
        .optional()
        .isInt({ min: 1 })
        .withMessage("ID médecin invalide"),

      body("mot_de_passe")
        .optional()
        .isLength({ min: 6 })
        .withMessage("Le mot de passe doit contenir au moins 6 caractères")
    ];
  }

  validateUpdatePassword() {
    return [
      body("ancien_mot_de_passe")
        .isLength({ min: 1 })
        .withMessage("L'ancien mot de passe est requis"),
      body("nouveau_mot_de_passe")
        .isLength({ min: 6 })
        .withMessage("Le nouveau mot de passe doit contenir au moins 6 caractères")
    ];
  }

  validatePagination() {
    return [
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("La page doit être un nombre positif"),
      query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("La limite doit être entre 1 et 100"),
      query("search")
        .optional()
        .isLength({ min: 2 })
        .withMessage("La recherche doit contenir au moins 2 caractères")
    ];
  }

  // Validation de l'email pour le mot de passe oublié
  validateEmail() {
    return [
      body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Email invalide")
    ];
  }

  // Validation de la réinitialisation de mot de passe
  validateResetPassword() {
    return [
      body("token")
        .isLength({ min: 1 })
        .withMessage("Le token est requis"),
      body("password")
        .isLength({ min: 6 })
        .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
      body("confirmPassword")
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Les mots de passe ne correspondent pas");
          }
          return true;
        })
    ];
  }
}

module.exports = new ValidationMiddleware();