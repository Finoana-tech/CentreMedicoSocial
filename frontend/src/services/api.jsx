// services/api.js
const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  constructor() {
    // Récupérer le token au démarrage
    this.token = localStorage.getItem('authToken');
    //console.log('🔧 ApiService initialisé - Token:', !!this.token);
  }

  setToken(token) {
   // console.log(' Définition du token dans apiService');
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  removeToken() {
    //console.log('🧹 Suppression du token dans apiService');
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Utiliser le token actuel (peut avoir été mis à jour)
    const currentToken = this.token || localStorage.getItem('authToken');
    
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
      //console.log('📤 Headers avec token:', currentToken.substring(0, 20) + '...');
    } else {
      //console.log('📤 Headers sans token');
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    //console.log(`🌐 Requête API: ${options.method || 'GET'} ${url}`);
    
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      //console.log(`📨 Réponse API: ${response.status} ${response.statusText}`);
      
      // Gérer les réponses sans contenu JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
        //console.log('📄 Réponse non-JSON:', data);
      }

      if (response.status === 401) {
        //console.log('🔒 Erreur 401 - Non autorisé');
        this.removeToken();
        // Ne pas rediriger automatiquement, laisser le AuthContext gérer
        throw new Error('Non autorisé - Session expirée');
      }

      if (!response.ok) {
        //console.error('❌ Erreur API:', data);
        throw new Error(data.message || data.error || `Erreur ${response.status}`);
      }

      //console.log('✅ Requête API réussie:', data);
      return data;

    } catch (error) {
      console.error(' Erreur API complète:', {
        endpoint,
        error: error.message,
        token: !!this.token
      });
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    //console.log('📤 Données envoyées:', data);
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Méthodes spécifiques pour la compatibilité
  async login(email, password) {
    //console.log(' Tentative de login via apiService');
    const data = await this.post('/api/utilisateurs/login', { 
      email, 
      mot_de_passe: password 
    });
    
    if (data.token) {
      this.setToken(data.token);
      //console.log(' Token défini après login');
    }
    
    return data;
  }

  isAuthenticated() {
    const isAuth = !!this.token;
    //console.log('Vérification auth:', isAuth);
    return isAuth;
  }

  async logout() {
    //console.log(' Logout via apiService');
    try {
      await this.post('/api/utilisateurs/logout');
    } catch (error) {
      //console.log(' Erreur lors du logout API (nettoyage local quand même)');
    } finally {
      this.removeToken();
    }
  }

  async getProfile() {
    //console.log(' Récupération du profil via apiService');
    return this.get('/api/utilisateurs/profile');
  }
}

export const apiService = new ApiService();
export default apiService;