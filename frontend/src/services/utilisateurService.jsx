import { apiService } from './api';

class UtilisateurService {
  
  async login(data) {
    try {
      const normalizedData = this.normalizeLoginData(data);
      const response = await fetch('http://localhost:5000/api/utilisateurs/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedData)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Erreur de connexion');

      this.refreshUserData(result);
      return result;
    } catch (error) {
      console.error(' UtilisateurService.login - Erreur:', error);
      throw new Error(error.message || 'Erreur lors de la connexion');
    }
  }

  async register(data) {
    try {
      const normalizedData = this.normalizeUtilisateurData(data);
      const response = await fetch('http://localhost:5000/api/utilisateurs/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedData)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Erreur d\'inscription');

      this.refreshUserData(result);
      return result;
    } catch (error) {
      console.error(' UtilisateurService.register - Erreur:', error);
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
  }

  async logout() {
    try {
      const token = apiService.token || localStorage.getItem('authToken');
      await fetch('http://localhost:5000/api/utilisateurs/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      this.clearAuthData();
      return { success: true };
    } catch (error) {
      console.error(' UtilisateurService.logout - Erreur:', error);
      this.clearAuthData();
      throw new Error(error.message || 'Erreur lors de la déconnexion');
    }
  }

  async getProfile() {
    try {
      const token = apiService.token || localStorage.getItem('authToken');
      if (!token) throw new Error('Token manquant');

      const response = await fetch('http://localhost:5000/api/utilisateurs/profile', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Erreur profil');

      return result;
    } catch (error) {
      console.error(' UtilisateurService.getProfile - Erreur:', error);
      if (error.message.includes('401')) this.clearAuthData();
      throw new Error(error.message || 'Erreur lors de la récupération du profil');
    }
  }


  getAll() {
    return this.listUsers();
  }

  async listUsers() {
    try {
      const token = apiService.token || localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/utilisateurs', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Erreur chargement utilisateurs');
      return result.data;
    } catch (error) {
      console.error(' UtilisateurService.listUsers - Erreur:', error);
      throw new Error(error.message || 'Erreur lors de la récupération des utilisateurs');
    }
  }

  async create(data) { return this.createUser(data); }
  async createUser(data) {
    try {
      const token = apiService.token || localStorage.getItem('authToken');
      const normalizedData = this.normalizeUtilisateurData(data);
      const response = await fetch('http://localhost:5000/api/utilisateurs/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(normalizedData)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Erreur création utilisateur');
      return result.data;
    } catch (error) {
      console.error(' UtilisateurService.createUser - Erreur:', error);
      throw new Error(error.message || 'Erreur lors de la création de l’utilisateur');
    }
  }

  async update(id, data) { return this.updateUser(id, data); }
  async updateUser(id, data) {
    try {
      const token = apiService.token || localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/utilisateurs/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Erreur mise à jour utilisateur');
      return result.data;
    } catch (error) {
      console.error(' UtilisateurService.updateUser - Erreur:', error);
      throw new Error(error.message || 'Erreur lors de la mise à jour de l’utilisateur');
    }
  }

  async delete(id) { return this.deleteUser(id); }
  async deleteUser(id) {
    try {
      const token = apiService.token || localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/utilisateurs/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Erreur suppression utilisateur');
      return result.data;
    } catch (error) {
      console.error(' UtilisateurService.deleteUser - Erreur:', error);
      throw new Error(error.message || 'Erreur lors de la suppression de l’utilisateur');
    }
  }

  async toggleUser(id, actif) {
    try {
      const token = apiService.token || localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/utilisateurs/${id}/actif`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actif })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Erreur activation / désactivation');
      return result.data;
    } catch (error) {
      console.error(' UtilisateurService.toggleUser - Erreur:', error);
      throw new Error(error.message || 'Erreur lors de la mise à jour du statut utilisateur');
    }
  }

  async requestPasswordReset(email) {
    try {
      const response = await fetch('http://localhost:5000/api/utilisateurs/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erreur demande de réinitialisation');

      return {
        success: true,
        message: 'Un email de réinitialisation a été envoyé si l’adresse existe.',
        email,
        token: result.token
      };
    } catch (error) {
      console.error(' UtilisateurService.requestPasswordReset - Erreur:', error);
      throw new Error(error.message || 'Erreur lors de la demande de réinitialisation');
    }
  }

  async resetPassword(token, nouveau_mot_de_passe) {
    try {
      const response = await fetch('http://localhost:5000/api/utilisateurs/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nouveau_mot_de_passe })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erreur réinitialisation mot de passe');

      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
        data: result.data
      };
    } catch (error) {
      console.error(' UtilisateurService.resetPassword - Erreur:', error);
      throw new Error(error.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  }

  refreshUserData(result) {
    if (result?.data?.token) {
      apiService.setToken(result.data.token);
      localStorage.setItem('authToken', result.data.token);
    }
    if (result?.data?.user) {
      localStorage.setItem('userData', JSON.stringify(result.data.user));
    }
  }

  clearAuthData() {
    apiService.removeToken();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  normalizeLoginData(data) {
    return {
      email: data.email?.trim().toLowerCase(),
      mot_de_passe: data.password || data.mot_de_passe
    };
  }

  normalizeUtilisateurData(data) {
    const normalized = { ...data };
    if (normalized.email) normalized.email = normalized.email.trim().toLowerCase();
    if (normalized.password && !normalized.mot_de_passe) {
      normalized.mot_de_passe = normalized.password;
      delete normalized.password;
    }
    if (!normalized.role) normalized.role = 'utilisateur';
    if (normalized.actif === undefined) normalized.actif = true;
    return normalized;
  }

  isAuthenticated() {
    const token = apiService.token || localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return !!(token && userData);
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur parsing userData:', error);
      return null;
    }
  }
}

export const utilisateurService = new UtilisateurService();
export default utilisateurService;
