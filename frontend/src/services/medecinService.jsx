// src/services/medecinService.js
import { apiService } from './api';

class MedecinService {
  async getAll() {
    try {
      console.log('Chargement de tous les médecins...');
      const res = await apiService.get('/api/medecin');
      
      let data = res.data || res;
      
      if (Array.isArray(data)) {
        const medecinsFormatted = data.map(medecin => this.formatMedecinData(medecin));
        console.log(medecinsFormatted.length + ' médecins formatés');
        return medecinsFormatted;
      }
      
      if (data && Array.isArray(data.data)) {
        const medecinsFormatted = data.data.map(medecin => this.formatMedecinData(medecin));
        console.log(medecinsFormatted.length + ' médecins formatés (from data property)');
        return medecinsFormatted;
      }
      
      console.warn('Format de données inattendu:', data);
      return [];
      
    } catch (error) {
      console.error('Erreur medecinService.getAll:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      console.log('Récupération médecin ID: ' + id);
      const res = await apiService.get(`/api/medecin/${id}`);
      const data = res.data || res;
      return this.formatMedecinData(data);
    } catch (error) {
      console.error('Erreur medecinService.getById:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const res = await apiService.post('/api/medecin', data);
      return res.data || res;
    } catch (error) {
      console.error('Erreur medecinService.create:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const res = await apiService.put(`/api/medecin/${id}`, data);
      return res.data || res;
    } catch (error) {
      console.error('Erreur medecinService.update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const res = await apiService.delete(`/api/medecin/${id}`);
      return res.data || res;
    } catch (error) {
      console.error('Erreur medecinService.delete:', error);
      throw error;
    }
  }

  async search(query) {
    try {
      const res = await apiService.get(`/api/medecin/search?q=${encodeURIComponent(query)}`);
      
      let data = res.data || res;
      
      if (Array.isArray(data)) {
        return data.map(medecin => this.formatMedecinData(medecin));
      }
      
      if (data && Array.isArray(data.data)) {
        return data.data.map(medecin => this.formatMedecinData(medecin));
      }
      
      return [];
      
    } catch (error) {
      console.error('Erreur medecinService.search:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const res = await apiService.get('/api/medecin/stats');
      return res.data || res;
    } catch (error) {
      console.error('Erreur medecinService.getStats:', error);
      throw error;
    }
  }

  async updateDisponibilite(id, disponibilite) {
    try {
      const res = await apiService.patch(`/api/medecin/${id}/disponibilite`, { disponibilite });
      return res.data || res;
    } catch (error) {
      console.error('Erreur medecinService.updateDisponibilite:', error);
      throw error;
    }
  }

  async getByDisponibilite(disponibilite) {
    try {
      const res = await apiService.get(`/api/medecin/disponibilite/${disponibilite}`);
      let data = res.data || res;
      
      if (Array.isArray(data)) {
        return data.map(medecin => this.formatMedecinData(medecin));
      }
      
      if (data && Array.isArray(data.data)) {
        return data.data.map(medecin => this.formatMedecinData(medecin));
      }
      
      return [];
    } catch (error) {
      console.error('Erreur medecinService.getByDisponibilite:', error);
      throw error;
    }
  }

  formatMedecinData(medecin) {
    if (!medecin) return null;
    
    console.log('Structure médecin brute:', {
      id: medecin.id,
      id_medecin: medecin.id_medecin,
      nom: medecin.nom,
      prenom: medecin.prenom,
      specialite: medecin.specialite,
      disponibilite: medecin.disponibilite,
      allKeys: Object.keys(medecin)
    });
    
    let id_medecin;
    
    // CORRECTION : Toujours utiliser id_medecin pour la cohérence avec le backend
    if (medecin.id_medecin !== undefined && medecin.id_medecin !== null) {
      id_medecin = parseInt(medecin.id_medecin);
      console.log('Utilisation id_medecin: ' + id_medecin);
    }
    else if (medecin.id !== undefined && medecin.id !== null) {
      id_medecin = parseInt(medecin.id);
      console.log('Utilisation id (converti en id_medecin): ' + id_medecin);
    }
    else {
      id_medecin = Math.floor(Math.random() * 1000);
      console.warn('Aucun ID trouvé, génération temporaire: ' + id_medecin);
    }
    
    if (isNaN(id_medecin) || id_medecin <= 0) {
      console.error('ID médecin invalide après formatage: ' + id_medecin);
      id_medecin = 0;
    }
    
    // CORRECTION : Utiliser id_medecin au lieu de id pour correspondre au formulaire
    const formatted = {
      id_medecin: id_medecin, // CORRECTION CRITIQUE : id_medecin au lieu de id
      nom: medecin.nom || '',
      prenom: medecin.prenom || '',
      specialite: medecin.specialite || '',
      telephone: medecin.telephone || '',
      adresse: medecin.adresse || '',
      email: medecin.email || '',
      disponibilite: medecin.disponibilite || 'disponible',
      _raw: medecin
    };
    
    console.log('Médecin formaté: Dr. ' + formatted.prenom + ' ' + formatted.nom + ' (ID: ' + formatted.id_medecin + ', Disponibilité: ' + formatted.disponibilite + ')');
    
    return formatted;
  }

  validateMedecinStructure(medecins) {
    if (!Array.isArray(medecins)) {
      console.error('validateMedecinStructure: Input n est pas un tableau');
      return false;
    }
    
    const validMedecins = medecins.filter(medecin => {
      // CORRECTION : Vérifier id_medecin au lieu de id
      const isValid = medecin && 
                     medecin.id_medecin && 
                     typeof medecin.id_medecin === 'number' && 
                     medecin.id_medecin > 0 &&
                     medecin.nom && 
                     medecin.prenom;
      
      if (!isValid) {
        console.warn('Médecin invalide:', medecin);
      }
      
      return isValid;
    });
    
    console.log(validMedecins.length + '/' + medecins.length + ' médecins valides');
    return validMedecins.length === medecins.length;
  }

  // NOUVELLE MÉTHODE : Test de diagnostic
  async testConnection() {
    try {
      console.log('🧪 Test de connexion MedecinService...');
      
      const medecins = await this.getAll();
      console.log('✅ MedecinService - Médecins chargés:', medecins.length);
      
      if (medecins.length > 0) {
        console.log('🔍 Premier médecin:', {
          id_medecin: medecins[0].id_medecin,
          nom: medecins[0].nom,
          prenom: medecins[0].prenom,
          type_id: typeof medecins[0].id_medecin
        });
      }
      
      return medecins;
    } catch (error) {
      console.error('❌ Test MedecinService échoué:', error);
      throw error;
    }
  }
}

export const medecinService = new MedecinService();
export default medecinService;