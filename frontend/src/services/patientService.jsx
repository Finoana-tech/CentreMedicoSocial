import { apiService } from './api';

class PatientService {
  async getAll() {
    const res = await apiService.get('/api/patient');
    return res.data || res;
  }

  async getById(id) {
    const res = await apiService.get(`/api/patient/${id}`);
    return res.data || res;
  }

  async create(data) {
    const res = await apiService.post('/api/patient', data);
    return res.data || res;
  }

  async update(id, data) {
    const res = await apiService.put(`/api/patient/${id}`, data);
    return res.data || res;
  }

  async delete(id) {
    const res = await apiService.delete(`/api/patient/${id}`);
    return res.data || res;
  }

  async search(query) {
    const res = await apiService.get(`/api/patient/search/all?q=${encodeURIComponent(query)}`);
    return res.data || res;
  }

  async getStats() {
    const res = await apiService.get('/api/patient/stats');
    return res.data || res;
  }

  async getTuteursPotentiels() {
    const res = await apiService.get('/api/patient/tuteurs/potentiels');
    return res.data || res;
  }
}

export const patientService = new PatientService();
export default patientService;