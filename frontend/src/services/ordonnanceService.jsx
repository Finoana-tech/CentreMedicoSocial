import { apiService } from './api';

class OrdonnanceService {
  async getAll() {
    const res = await apiService.get('/api/ordonnance'); 
    return res.data || res;
  }

  async getById(id) {
    const res = await apiService.get(`/api/ordonnance/${id}`); 
    return res.data || res;
  }

  async getDetailsById(id) {
    const res = await apiService.get(`/api/ordonnance/${id}/details`);
    return res.data || res;
  }

  async create(data) {
    const res = await apiService.post('/api/ordonnance', data); 
    return res.data || res;
  }

  async update(id, data) {
    const res = await apiService.put(`/api/ordonnance/${id}`, data); 
    return res.data || res;
  }

  async delete(id) {
    const res = await apiService.delete(`/api/ordonnance/${id}`); 
    return res.data || res;
  }

  async search(query) {
    const res = await apiService.get(`/api/ordonnance/search?q=${encodeURIComponent(query)}`); 
    return res.data || res;
  }

  async valider(id, validated_by) {
    const res = await apiService.patch(`/api/ordonnance/${id}/valider`, { validated_by }); 
    return res.data || res;
  }

  async marquerEnPreparation(id) {
    const res = await apiService.patch(`/api/ordonnance/${id}/preparation`);
    return res.data || res;
  }

  async delivrer(id) {
    const res = await apiService.patch(`/api/ordonnance/${id}/delivrer`);
    return res.data || res;
  }

  async annuler(id) {
    const res = await apiService.patch(`/api/ordonnance/${id}/annuler`);
    return res.data || res;
  }

  async utiliserRenouvellement(id) {
    const res = await apiService.patch(`/api/ordonnance/${id}/renouveler`); 
    return res.data || res;
  }

  async estValide(id) {
    const res = await apiService.get(`/api/ordonnance/${id}/validite`); 
    return res.data || res;
  }

  async getStatsByStatut() {
    const res = await apiService.get('/api/ordonnance/stats/statut'); 
    return res.data || res;
  }

  async getOrdonnancesUrgentes() {
    const res = await apiService.get('/api/ordonnance/urgentes'); 
    return res.data || res;
  }

  async getRecentPrescriptions() {
    const res = await apiService.get('/api/ordonnance/recentes'); 
    return res.data || res;
  }

  async countOrdonnancesThisMonth() {
    const res = await apiService.get('/api/ordonnance/stats/mois'); 
    return res.data || res;
  }

  async getRenouvellementsRestants(id) {
    const res = await apiService.get(`/api/ordonnance/${id}/renouvellements-restants`); 
    return res.data || res;
  }

  async renouvelerOrdonnance(id) {
    const res = await apiService.post(`/api/ordonnance/${id}/renouveler-copie`); 
    return res.data || res;
  }


  // Exporter une ordonnance en PDF
  async exportToPDF(id) {
    try {
      const response = await fetch(`http://localhost:5000/api/ordonnance/${id}/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ordonnance-JIRAMA-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'PDF exporté avec succès' };
    } catch (error) {
      console.error('Erreur export PDF:', error);
      throw error;
    }
  }


  formatOrdonnanceData(formData) {
    return {
      id_patient: formData.id_patient,
      id_medecin: formData.id_medecin,
      date_prescription: formData.date_prescription,
      instructions: formData.instructions || '',
      diagnostic: formData.diagnostic || '',
      statut: formData.statut || 'Brouillon',
      renouvelable: formData.renouvelable || false,
      nb_renouvellements_autorises: formData.nb_renouvellements_autorises || 0,
      duree_validite: formData.duree_validite || 30,
      urgence: formData.urgence || false,
      notes: formData.notes || '',
      medicaments: formData.medicaments || []
    };
  }

 
  canBeModified(statut) {
    const statutsModifiables = ['Brouillon', 'Validée'];
    return statutsModifiables.includes(statut);
  }

  canBeDelivered(statut) {
    const statutsDelivrables = ['Validée', 'En préparation'];
    return statutsDelivrables.includes(statut);
  }
}

export const ordonnanceService = new OrdonnanceService();
export default ordonnanceService;