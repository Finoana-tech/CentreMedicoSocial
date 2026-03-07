// src/services/ordonnanceService.js
import { apiService } from './api';

class OrdonnanceService {
  async getAll() {
    const res = await apiService.get('/api/ordonnance'); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  async getById(id) {
    const res = await apiService.get(`/api/ordonnance/${id}`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // 🆕 NOUVELLE MÉTHODE : Récupérer les détails complets pour l'affichage
  async getDetailsById(id) {
    const res = await apiService.get(`/api/ordonnance/${id}/details`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  async create(data) {
    const res = await apiService.post('/api/ordonnance', data); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  async update(id, data) {
    const res = await apiService.put(`/api/ordonnance/${id}`, data); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  async delete(id) {
    const res = await apiService.delete(`/api/ordonnance/${id}`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  async search(query) {
    const res = await apiService.get(`/api/ordonnance/search?q=${encodeURIComponent(query)}`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // === NOUVELLES MÉTHODES WORKFLOW ===

  // Valider une ordonnance
  async valider(id, validated_by) {
    const res = await apiService.patch(`/api/ordonnance/${id}/valider`, { validated_by }); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // Marquer comme en préparation
  async marquerEnPreparation(id) {
    const res = await apiService.patch(`/api/ordonnance/${id}/preparation`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // Délivrer une ordonnance
  async delivrer(id) {
    const res = await apiService.patch(`/api/ordonnance/${id}/delivrer`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // Annuler une ordonnance
  async annuler(id) {
    const res = await apiService.patch(`/api/ordonnance/${id}/annuler`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // Utiliser un renouvellement
  async utiliserRenouvellement(id) {
    const res = await apiService.patch(`/api/ordonnance/${id}/renouveler`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // Vérifier la validité d'une ordonnance
  async estValide(id) {
    const res = await apiService.get(`/api/ordonnance/${id}/validite`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // === NOUVELLES MÉTHODES STATISTIQUES ===

  // Obtenir les statistiques par statut
  async getStatsByStatut() {
    const res = await apiService.get('/api/ordonnance/stats/statut'); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // Obtenir les ordonnances urgentes
  async getOrdonnancesUrgentes() {
    const res = await apiService.get('/api/ordonnance/urgentes'); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // Obtenir les ordonnances récentes
  async getRecentPrescriptions() {
    const res = await apiService.get('/api/ordonnance/recentes'); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // Compter les ordonnances du mois
  async countOrdonnancesThisMonth() {
    const res = await apiService.get('/api/ordonnance/stats/mois'); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // === 🆕 NOUVELLES MÉTHODES RENOUVELLEMENT ===

  // Obtenir le nombre de renouvellements restants
  async getRenouvellementsRestants(id) {
    const res = await apiService.get(`/api/ordonnance/${id}/renouvellements-restants`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // Créer une copie renouvelée de l'ordonnance
  async renouvelerOrdonnance(id) {
    const res = await apiService.post(`/api/ordonnance/${id}/renouveler-copie`); // CORRIGÉ : /api/ordonnance
    return res.data || res;
  }

  // === 🆕 MÉTHODE EXPORT PDF ===

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

  // === 🆕 MÉTHODE UTILITAIRE POUR LE FORMULAIRE ===

  // Formater les données pour la création/mise à jour
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

  // 🆕 Méthode pour vérifier si une ordonnance peut être modifiée
  canBeModified(statut) {
    const statutsModifiables = ['Brouillon', 'Validée'];
    return statutsModifiables.includes(statut);
  }

  // 🆕 Méthode pour vérifier si une ordonnance peut être délivrée
  canBeDelivered(statut) {
    const statutsDelivrables = ['Validée', 'En préparation'];
    return statutsDelivrables.includes(statut);
  }
}

export const ordonnanceService = new OrdonnanceService();
export default ordonnanceService;