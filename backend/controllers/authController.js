//  backend/controllers/authController.js
const UserModel = require('../models/utilisateurModel');
const { hashPassword, comparePasswords } = require('../utils/passwordUtils');
const jwt = require('jsonwebtoken');

const authController = {

  //  CONNEXION UTILISATEUR
  async login(req, res) {
    try {
      const { email, mot_de_passe } = req.body;

      //  VALIDATION DES DONNÉES
      if (!email || !mot_de_passe) {
        return res.status(400).json({ 
          success: false,
          message: 'Email et mot de passe sont requis' 
        });
      }

      //  VÉRIFICATION SI L'UTILISATEUR EXISTE
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Email ou mot de passe incorrect' 
        });
      }

      //  VÉRIFICATION DU MOT DE PASSE
      const isPasswordValid = await comparePasswords(mot_de_passe, user.mot_de_passe);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          message: 'Email ou mot de passe incorrect' 
        });
      }

      //  GÉNÉRATION DU TOKEN JWT
      const tokenPayload = {
        id_utilisateur: user.id_utilisateur,
        email: user.email,
        role: user.role,
        id_medecin: user.id_medecin
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Token valable 24 heures
      );

      //  RÉPONSE SUCCÈS
      res.json({
        success: true,
        message: 'Connexion réussie',
        token: token,
        user: {
          id_utilisateur: user.id_utilisateur,
          email: user.email,
          role: user.role,
          id_medecin: user.id_medecin,
          date_creation: user.date_creation
        }
      });

    } catch (error) {
      console.error(' Erreur lors de la connexion:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur lors de la connexion' 
      });
    }
  },

  //  RÉCUPÉRATION DU PROFIL UTILISATEUR
  async getProfile(req, res) {
    try {
      // req.user est injecté par le middleware authenticateToken
      const user = await UserModel.findById(req.user.id_utilisateur);
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      // NE JAMAIS ENVOYER LE MOT DE PASSE DANS LA RÉPONSE
      const { mot_de_passe, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error(' Erreur récupération profil:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur lors de la récupération du profil' 
      });
    }
  },

  //  INSCRIPTION D'UN NOUVEL UTILISATEUR (Admin seulement)
  async register(req, res) {
    try {
      const { email, mot_de_passe, role, id_medecin } = req.body;

      // . VALIDATION DES DONNÉES
      if (!email || !mot_de_passe || !role) {
        return res.status(400).json({ 
          success: false,
          message: 'Email, mot de passe et rôle sont requis' 
        });
      }

      // . VÉRIFICATION SI L'EMAIL EXISTE DÉJÀ
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'Un utilisateur avec cet email existe déjà' 
        });
      }

      // . HACHAGE DU MOT DE PASSE
      const hashedPassword = await hashPassword(mot_de_passe);

      // . CRÉATION DE L'UTILISATEUR
      const userId = await UserModel.create({
        email,
        mot_de_passe: hashedPassword,
        role,
        id_medecin: id_medecin || null
      });

      // 5. RÉPONSE SUCCÈS
      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        userId: userId
      });

    } catch (error) {
      console.error(' Erreur lors de l\'inscription:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ 
          success: false,
          message: 'Un utilisateur avec cet email existe déjà' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur lors de la création de l\'utilisateur' 
      });
    }
  },

  //  MODIFICATION DU MOT DE PASSE
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id_utilisateur;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false,
          message: 'Mot de passe actuel et nouveau mot de passe sont requis' 
        });
      }

      // 1. RÉCUPÉRER L'UTILISATEUR
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      //  VÉRIFIER LE MOT DE PASSE ACTUEL
      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.mot_de_passe);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ 
          success: false,
          message: 'Mot de passe actuel incorrect' 
        });
      }

      //  HACHER ET METTRE À JOUR LE NOUVEAU MOT DE PASSE
      const newHashedPassword = await hashPassword(newPassword);
      // Vous devrez ajouter cette méthode dans votre UserModel
      await UserModel.updatePassword(userId, newHashedPassword);

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès'
      });

    } catch (error) {
      console.error(' Erreur modification mot de passe:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur lors de la modification du mot de passe' 
      });
    }
  },

  //  DÉCONNEXION (côté client généralement, mais peut être utile pour invalidation)
  async logout(req, res) {
    try {
      // En général, la déconnexion se fait côté client en supprimant le token
      // Mais vous pourriez implémenter une blacklist de tokens ici si nécessaire
      
      res.json({
        success: true,
        message: 'Déconnexion réussie'
      });

    } catch (error) {
      console.error(' Erreur lors de la déconnexion:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur lors de la déconnexion' 
      });
    }
  }
};

module.exports = authController;