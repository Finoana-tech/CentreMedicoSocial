const UserModel = require('../models/utilisateurModel');
const { hashPassword, comparePasswords } = require('../utils/passwordUtils');
const jwt = require('jsonwebtoken');

const authController = {

  async login(req, res) {
    try {
      const { email, mot_de_passe } = req.body;

      if (!email || !mot_de_passe) {
        return res.status(400).json({ 
          success: false,
          message: 'Email et mot de passe sont requis' 
        });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Email ou mot de passe incorrect' 
        });
      }

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
        { expiresIn: '24h' } 
      );

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

  async getProfile(req, res) {
    try {

      const user = await UserModel.findById(req.user.id_utilisateur);
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

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

  async register(req, res) {
    try {
      const { email, mot_de_passe, role, id_medecin } = req.body;

      if (!email || !mot_de_passe || !role) {
        return res.status(400).json({ 
          success: false,
          message: 'Email, mot de passe et rôle sont requis' 
        });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'Un utilisateur avec cet email existe déjà' 
        });
      }

      const hashedPassword = await hashPassword(mot_de_passe);
      const userId = await UserModel.create({
        email,
        mot_de_passe: hashedPassword,
        role,
        id_medecin: id_medecin || null
      });

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

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.mot_de_passe);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ 
          success: false,
          message: 'Mot de passe actuel incorrect' 
        });
      }

      const newHashedPassword = await hashPassword(newPassword);
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

  async logout(req, res) {
    try {
      
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