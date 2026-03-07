// middleware/auth.js
const jwt = require("jsonwebtoken");
const UtilisateurModel = require("../models/utilisateurModel");

const SECRET = process.env.JWT_SECRET || "votre_secret_jwt_tres_securise";

const authMiddleware = {
  // Vérifie le token JWT et ajoute req.user
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Token d'authentification manquant"
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, SECRET);

      const user = await UtilisateurModel.findById(decoded.id);
      if (!user || !user.actif) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non trouvé ou compte désactivé"
        });
      }

      req.user = {
        id: user.id_utilisateur,
        email: user.email,
        role: user.role,
        id_medecin: user.id_medecin
      };

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expiré"
        });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Token invalide"
        });
      }
      console.error("Erreur authMiddleware.verifyToken:", error);
      res.status(500).json({
        success: false,
        message: "Erreur d'authentification"
      });
    }
  },

  // Vérifie que l'utilisateur a un rôle précis
  requireRole(requiredRole) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentification requise"
        });
      }
      if (req.user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Accès refusé. Rôle ${requiredRole} requis.`
        });
      }
      next();
    };
  },

  // Vérifie que l'utilisateur a un des rôles autorisés
  requireAnyRole(allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentification requise"
        });
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Accès refusé. Rôles autorisés : ${allowedRoles.join(", ")}`
        });
      }
      next();
    };
  },

  // Vérifie si l'utilisateur est propriétaire de la ressource ou admin
  isOwnerOrAdmin(paramName = "id") {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentification requise"
        });
      }

      const resourceId = parseInt(req.params[paramName], 10);
      const userId = req.user.id;

      if (req.user.role !== "admin" && userId !== resourceId) {
        return res.status(403).json({
          success: false,
          message: "Vous ne pouvez accéder qu'à vos propres ressources"
        });
      }

      next();
    };
  }
};

module.exports = authMiddleware;