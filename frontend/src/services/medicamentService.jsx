import { apiService } from './api';

class MedicamentService {
  async getAll() {
    const res = await apiService.get('/api/medicament');
    return res.data || res; 
  }

  async getById(id) {
    const res = await apiService.get(`/api/medicament/${id}`);
    return res.data || res;
  }

  async create(data) {
    const res = await apiService.post('/api/medicament', data);
    return res.data || res;
  }

  async update(id, data) {
    const res = await apiService.put(`/api/medicament/${id}`, data);
    return res.data || res;
  }

  async delete(id) {
    const res = await apiService.delete(`/api/medicament/${id}`);
    return res.data || res;
  }

  async search(query) {
    const res = await apiService.get(`/api/medicament/search?q=${encodeURIComponent(query)}`);
    return res.data || res;
  }

  async getStockCritique() {
    const res = await apiService.get('/api/medicament/stock/critique');
    return res.data || res;
  }

  async getByClasseTherapeutique(classe) {
    const res = await apiService.get(`/api/medicament/classe/${encodeURIComponent(classe)}`);
    return res.data || res;
  }

  async updateStock(id, stock_actuel) {
    const res = await apiService.patch(`/api/medicament/${id}/stock`, { stock_actuel });
    return res.data || res;
  }

  async getStats() {
    const res = await apiService.get('/api/medicament/stats');
    return res.data || res;
  }
}

export const medicamentService = new MedicamentService();
export default medicamentService;