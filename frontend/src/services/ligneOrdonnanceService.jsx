// services/ligneOrdonnanceService.js
import apiService from './api';

class LigneOrdonnanceService {
  // CRUD
  async getAll() {
    return apiService.get('/ligne_ordonnance');
  }

  async getById(id) {
    return apiService.get(`/ligne_ordonnance/${id}`);
  }

  async create(ligneData) {
    return apiService.post('/ligne_ordonnance', ligneData);
  }

  async update(id, ligneData) {
    return apiService.put(`/ligne_ordonnance/${id}`, ligneData);
  }

  async delete(id) {
    return apiService.delete(`/ligne_ordonnance/${id}`);
  }

  // Recherche
  async search(searchTerm, filters = {}) {
    const params = new URLSearchParams();
    if (searchTerm) params.append('term', searchTerm);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    return apiService.get(`/ligne_ordonnance/search?${params.toString()}`);
  }

  // Statistiques
  async getStats() {
    return apiService.get('/ligne_ordonnance/stats');
  }

  async getStatsByMedicament() {
    return apiService.get('/ligne_ordonnance/stats/medicament');
  }

  async getStatsByStatus() {
    return apiService.get('/ligne_ordonnance/stats/status');
  }

  // Fonctions spécifiques
  async getByOrdonnance(ordonnanceId) {
    return apiService.get(`/ligne_ordonnance/ordonnance/${ordonnanceId}`);
  }

  async getByMedicament(medicamentId) {
    return apiService.get(`/ligne_ordonnance/medicament/${medicamentId}`);
  }

  async updateDeliveryStatus(id, status) {
    return apiService.patch(`/ligne_ordonnance/${id}/delivrance`, { status });
  }

  async getPendingDeliveries() {
    return apiService.get('/ligne_ordonnance/en-attente');
  }

  async importMultiple(lignes) {
    return apiService.post('/ligne_ordonnance/import/multiple', { lignes });
  }
}

export const ligneOrdonnanceService = new LigneOrdonnanceService();
export default ligneOrdonnanceService;