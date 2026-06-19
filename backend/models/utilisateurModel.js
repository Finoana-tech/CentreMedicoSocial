const db = require("../config/db");
const bcrypt = require("bcryptjs");

const UtilisateurModel = {

  async create(data) {
    try {
      if (data.role === "medecin" && data.id_medecin) {
        const [medRows] = await db.execute(
          `SELECT * FROM medecin WHERE id_medecin = ?`,
          [data.id_medecin]
        );
        if (medRows.length === 0) {
          throw new Error("Médecin inexistant dans la base");
        }
      }

      const hash = await bcrypt.hash(data.mot_de_passe, 10);
      const [result] = await db.execute(
        `INSERT INTO utilisateurs (email, mot_de_passe, role, id_medecin, actif)
         VALUES (?, ?, ?, ?, ?)`,
        [data.email, hash, data.role, data.id_medecin || null, data.actif ?? 1]
      );
      return { 
        id_utilisateur: result.insertId, 
        email: data.email,
        role: data.role,
        id_medecin: data.id_medecin || null,
        actif: data.actif ?? 1
      };
    } catch (err) {
      console.error("Erreur lors de la création :", err);
      throw err;
    }
  },

  // 🔹 Trouver un utilisateur par email
  async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM utilisateurs WHERE email = ?`, 
        [email]
      );
      return rows[0] || null;
    } catch (err) {
      console.error("Erreur findByEmail:", err);
      throw err;
    }
  },

  async findById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM utilisateurs WHERE id_utilisateur = ?`, 
        [id]
      );
      return rows[0] || null;
    } catch (err) {
      console.error("Erreur findById:", err);
      throw err;
    }
  },

  async findAll() {
    try {
      const [rows] = await db.execute(
        `SELECT id_utilisateur, email, role, id_medecin, actif, date_creation 
         FROM utilisateurs ORDER BY date_creation DESC`
      );
      return rows;
    } catch (err) {
      console.error("Erreur findAll:", err);
      throw err;
    }
  },
  async toggleActif(id, actif) {
    try {
      await db.execute(
        `UPDATE utilisateurs SET actif = ? WHERE id_utilisateur = ?`, 
        [actif, id]
      );
      return { id_utilisateur: id, actif };
    } catch (err) {
      console.error("Erreur toggleActif:", err);
      throw err;
    }
  },

  async updatePassword(id, newPassword) {
    try {
      const hash = await bcrypt.hash(newPassword, 10);
      await db.execute(
        `UPDATE utilisateurs SET mot_de_passe = ? WHERE id_utilisateur = ?`,
        [hash, id]
      );
      return { id_utilisateur: id, success: true };
    } catch (err) {
      console.error("Erreur updatePassword:", err);
      throw err;
    }
  },

  async update(id, data) {
    try {
      const fields = [];
      const values = [];
      
      if (data.email) {
        fields.push('email = ?');
        values.push(data.email);
      }
      if (data.role) {
        fields.push('role = ?');
        values.push(data.role);
      }
      if (data.id_medecin !== undefined) {
        if (data.role === "medecin" && data.id_medecin) {
          const [medRows] = await db.execute(
            `SELECT * FROM medecin WHERE id_medecin = ?`,
            [data.id_medecin]
          );
          if (medRows.length === 0) {
            throw new Error("Médecin inexistant dans la base");
          }
        }
        fields.push('id_medecin = ?');
        values.push(data.id_medecin);
      }
      if (data.actif !== undefined) {
        fields.push('actif = ?');
        values.push(data.actif);
      }
      
      if (fields.length === 0) {
        throw new Error("Aucune donnée à mettre à jour");
      }
      
      values.push(id);
      
      await db.execute(
        `UPDATE utilisateurs SET ${fields.join(', ')} WHERE id_utilisateur = ?`,
        values
      );
      
      return this.findById(id);
    } catch (err) {
      console.error("Erreur update:", err);
      throw err;
    }
  },

  async delete(id) {
    try {
      await db.execute(
        `DELETE FROM utilisateurs WHERE id_utilisateur = ?`,
        [id]
      );
      return { id_utilisateur: id, deleted: true };
    } catch (err) {
      console.error("Erreur delete:", err);
      throw err;
    }
  },

  async requestPasswordReset(email) {
    try {
      const user = await this.findByEmail(email.toLowerCase().trim());
      if (!user) return { success: false, message: "Utilisateur non trouvé" };
      return { success: true, email: user.email };
    } catch (err) {
      console.error("Erreur requestPasswordReset:", err);
      throw err;
    }
  },

  async resetPasswordByEmail(email, newPassword) {
    try {
      const user = await this.findByEmail(email.toLowerCase().trim());
      if (!user) return { success: false, message: "Utilisateur non trouvé" };
      const hash = await bcrypt.hash(newPassword, 10);
      await db.execute(
        `UPDATE utilisateurs SET mot_de_passe = ? WHERE email = ?`,
        [hash, email.toLowerCase().trim()]
      );
      return { success: true, message: "Mot de passe réinitialisé", id_utilisateur: user.id_utilisateur };
    } catch (err) {
      console.error("Erreur resetPasswordByEmail:", err);
      throw err;
    }
  }
};

module.exports = UtilisateurModel;
