const API_BASE_URL = 'http://localhost:5000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const currentToken = this.token || localStorage.getItem('authToken');
    
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    } else {
      //console.log(' Headers sans token');
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.status === 401) {
        this.removeToken();
        throw new Error('Non autorisé - Session expirée');
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Erreur ${response.status}`);
      }

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

  
  async login(email, password) {
    const data = await this.post('/api/utilisateurs/login', { 
      email, 
      mot_de_passe: password 
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  isAuthenticated() {
    const isAuth = !!this.token;
    return isAuth;
  }

  async logout() {
    try {
      await this.post('/api/utilisateurs/logout');
    } catch (error) {
      //console.log(' Erreur lors du logout API');
    } finally {
      this.removeToken();
    }
  }

  async getProfile() {
    return this.get('/api/utilisateurs/profile');
  }
}

export const apiService = new ApiService();
export default apiService;