// controllers/utilisateurController.js
const UtilisateurModel = require("../models/utilisateurModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db"); // Pour vérification medecin existant

const SECRET = process.env.JWT_SECRET || "secret-key";

const UtilisateurController = {

  // Connexion
  async login(req, res) {
    try {
      const { email, mot_de_passe } = req.body;
      if (!email || !mot_de_passe) {
        return res.status(400).json({ success: false, message: "Email et mot de passe requis" });
      }

      const user = await UtilisateurModel.findByEmail(email.toLowerCase().trim());
      if (!user || !user.actif) {
        return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
      }

      const match = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (!match) {
        return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
      }

      const token = jwt.sign({ id: user.id_utilisateur, role: user.role }, SECRET, { expiresIn: "7d" });

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id_utilisateur,
            email: user.email,
            role: user.role,
            actif: user.actif
          }
        }
      });

    } catch (err) {
      console.error("Erreur login:", err);
      res.status(500).json({ success: false, message: "Erreur lors de la connexion" });
    }
  },

  // Déconnexion
  async logout(req, res) {
    res.json({ success: true, message: "Déconnexion réussie" });
  },

  // Vérification du token
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ success: false, message: "Token manquant" });

      const decoded = jwt.verify(token, SECRET);
      const user = await UtilisateurModel.findById(decoded.id);
      if (!user || !user.actif) return res.status(401).json({ success: false, message: "Token invalide" });

      res.json({ success: true, data: { id: user.id_utilisateur, email: user.email, role: user.role } });
    } catch (err) {
      console.error("Erreur verifyToken:", err);
      res.status(401).json({ success: false, message: "Token invalide ou expiré" });
    }
  },

  // 🔹 Création d'utilisateur
  async create(req, res) {
    try {
      if (req.user.role !== "admin") return res.status(403).json({ message: "Accès refusé" });

      const { email, mot_de_passe, role, id_medecin } = req.body;
      const existing = await UtilisateurModel.findByEmail(email);
      if (existing) return res.status(409).json({ message: "Email déjà utilisé" });

      if (role === "medecin" && id_medecin) {
        const [medRows] = await db.execute(
          `SELECT * FROM medecin WHERE id_medecin = ?`,
          [id_medecin]
        );
        if (medRows.length === 0) {
          return res.status(400).json({ message: "Médecin inexistant dans la base" });
        }
      }

      const user = await UtilisateurModel.create({ email, mot_de_passe, role, id_medecin });
      res.status(201).json({ success: true, data: user });

    } catch (err) {
      console.error("Erreur create:", err);
      res.status(500).json({ message: "Erreur création utilisateur" });
    }
  },

  // Liste tous les utilisateurs
  async list(req, res) {
    try {
      if (req.user.role !== "admin") return res.status(403).json({ message: "Accès refusé" });

      const users = await UtilisateurModel.findAll();
      res.json({ success: true, data: users });

    } catch (err) {
      console.error("Erreur list:", err);
      res.status(500).json({ message: "Erreur chargement utilisateurs" });
    }
  },

  // Activer / désactiver un utilisateur
  async toggle(req, res) {
    try {
      if (req.user.role !== "admin") return res.status(403).json({ message: "Accès refusé" });

      const { id } = req.params;
      const { actif } = req.body;
      const updated = await UtilisateurModel.toggleActif(id, actif);

      res.json({ success: true, data: updated });

    } catch (err) {
      console.error("Erreur toggle:", err);
      res.status(500).json({ message: "Erreur mise à jour statut" });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await UtilisateurModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

      res.json({
        success: true,
        data: {
          id: user.id_utilisateur,
          email: user.email,
          role: user.role,
          actif: user.actif
        }
      });

    } catch (err) {
      console.error("Erreur getProfile:", err);
      res.status(500).json({ message: "Erreur profil" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      if (!data.mot_de_passe || data.mot_de_passe.trim() === "") delete data.mot_de_passe;

      if (data.role === "medecin" && data.id_medecin) {
        const [medRows] = await db.execute(
          `SELECT * FROM medecin WHERE id_medecin = ?`,
          [data.id_medecin]
        );
        if (medRows.length === 0) {
          return res.status(400).json({ message: "Médecin inexistant dans la base" });
        }
      }

      const user = await UtilisateurModel.update(id, data);
      res.json({ success: true, data: user });

    } catch (err) {
      console.error("Erreur update:", err);
      res.status(500).json({ message: "Erreur mise à jour profil" });
    }
  },

  async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { nouveau_mot_de_passe } = req.body;

      if (!nouveau_mot_de_passe || nouveau_mot_de_passe.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
      }

      const result = await UtilisateurModel.updatePassword(id, nouveau_mot_de_passe);
      res.json({ success: true, data: result });

    } catch (err) {
      console.error("Erreur updatePassword:", err);
      res.status(500).json({ message: "Erreur mise à jour mot de passe" });
    }
  },

  //  Mot de passe oublié (frontend page email)
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email requis" });

      const result = await UtilisateurModel.requestPasswordReset(email);
      if (!result.success) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }

      // Génération d’un token temporaire pour la réinitialisation (1h)
      const resetToken = jwt.sign({ email: result.email }, SECRET, { expiresIn: "1h" });

      //  Pas d'envoi email, juste renvoyer le token au frontend
      res.json({
        success: true,
        message: "Email vérifié, vous pouvez réinitialiser le mot de passe",
        token: resetToken,
        email: result.email
      });

    } catch (err) {
      console.error("Erreur forgotPassword:", err);
      res.status(500).json({ success: false, message: "Erreur lors de la demande de réinitialisation" });
    }
  },

  //  Réinitialisation du mot de passe
  async resetPassword(req, res) {
    try {
      const { token, nouveau_mot_de_passe } = req.body;
      if (!token || !nouveau_mot_de_passe) return res.status(400).json({ message: "Token et mot de passe requis" });

      const decoded = jwt.verify(token, SECRET);
      const { email } = decoded;

      if (nouveau_mot_de_passe.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
      }

      const result = await UtilisateurModel.resetPasswordByEmail(email, nouveau_mot_de_passe);
      if (!result.success) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });

      res.json({
        success: true,
        message: "Mot de passe réinitialisé avec succès, vous pouvez maintenant vous connecter",
        data: result
      });

    } catch (err) {
      console.error("Erreur resetPassword:", err);
      res.status(500).json({ success: false, message: "Erreur lors de la réinitialisation du mot de passe" });
    }
  }

};

module.exports = UtilisateurController;
