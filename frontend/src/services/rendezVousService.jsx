// src/services/rendezVousService.js
import { apiService } from './api';

class RendezVousService {
  constructor() {
    this.baseUrl = '/api/rendez-vous'; // CORRECTION : avec tiret pour correspondre au backend
  }

  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    // Ajouter les filtres aux paramètres de requête
    if (filters.statut) params.append('statut', filters.statut);
    if (filters.id_medecin) params.append('id_medecin', filters.id_medecin);
    if (filters.date) params.append('date', filters.date);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    console.log('🔍 Appel API Rendez-vous:', url);
    const res = await apiService.get(url);
    return res.data || res;
  }

  async getById(id) {
    if (!id) throw new Error('ID du rendez-vous requis');
    const res = await apiService.get(`${this.baseUrl}/${id}`);
    return res.data || res;
  }

  async create(data) {
    if (!data) throw new Error('Données du rendez-vous requises');
    if (!data.id_patient || !data.id_medecin || !data.date_heure || !data.motif) {
      throw new Error('Patient, médecin, date/heure et motif sont requis');
    }
    const res = await apiService.post(this.baseUrl, data);
    return res.data || res;
  }

  async update(id, data) {
    if (!id || !data) throw new Error('ID et données de mise à jour requis');
    const res = await apiService.put(`${this.baseUrl}/${id}`, data);
    return res.data || res;
  }

  async delete(id) {
    if (!id) throw new Error('ID du rendez-vous requis');
    const res = await apiService.delete(`${this.baseUrl}/${id}`);
    return res.data || res;
  }

  async search(query) {
    if (!query || query.trim().length === 0) {
      throw new Error('Terme de recherche requis');
    }
    if (query.trim().length < 2) {
      throw new Error('Le terme de recherche doit contenir au moins 2 caractères');
    }
    const res = await apiService.get(`${this.baseUrl}/search?q=${encodeURIComponent(query.trim())}`);
    return res.data || res;
  }

  async annuler(id, raison) {
    if (!id) throw new Error('ID du rendez-vous requis');
    if (!raison || raison.trim().length === 0) {
      throw new Error('Raison d\'annulation requise');
    }
    const res = await apiService.post(`${this.baseUrl}/${id}/annuler`, { 
      raison: raison.trim() 
    });
    return res.data || res;
  }

  // Vérification rapide de disponibilité
  async quickCheck(id_medecin, date, heure) {
    if (!id_medecin || !date || !heure) {
      throw new Error('Médecin, date et heure sont requis pour la vérification rapide');
    }
    
    // Validation de l'ID médecin
    const medecinId = parseInt(id_medecin);
    if (isNaN(medecinId) || medecinId <= 0) {
      throw new Error('ID du médecin invalide');
    }

    const params = new URLSearchParams({
      id_medecin: medecinId.toString(),
      date: date,
      heure: heure
    });

    const res = await apiService.get(`${this.baseUrl}/quick-check?${params}`);
    return res.data || res;
  }

  // Vérification complète de disponibilité
  async checkAvailability(data) {
    if (!data) throw new Error('Données de vérification requises');
    if (!data.id_medecin || !data.date_heure) {
      throw new Error('Médecin et date/heure sont requis pour la vérification');
    }
  
    // Validation de l'ID médecin côté frontend
    const medecinId = parseInt(data.id_medecin);
    if (isNaN(medecinId) || medecinId <= 0) {
      throw new Error('ID du médecin invalide');
    }

    const res = await apiService.post(`${this.baseUrl}/check-availability`, {
      ...data,
      id_medecin: medecinId // S'assurer que c'est un nombre
    });
    return res.data || res;
  }

  // CORRECTION IMPORTANTE : Utiliser la route dashboard, pas rendez-vous
  async getDashboardStats() {
    const res = await apiService.get('/api/dashboard/stats'); // CORRECTION : route dashboard
    return res.data || res;
  }

  async getTodayAppointments() {
    const res = await apiService.get(`${this.baseUrl}/today`);
    return res.data || res;
  }

  // Méthode de test de connexion
  async testConnection() {
    try {
      console.log('🧪 Test de connexion API Rendez-vous...');
      
      // Test de base
      const health = await apiService.get('/api/health');
      console.log('✅ Health check:', health);
      
      // Test des rendez-vous
      const rdvList = await this.getAll();
      console.log('✅ Rendez-vous chargés:', rdvList.length);
      
      // Test du dashboard
      const stats = await this.getDashboardStats();
      console.log('✅ Stats dashboard:', stats);
      
      return true;
    } catch (error) {
      console.error('❌ Test connexion échoué:', error);
      throw error;
    }
  }

  // SUPPRIMÉ : getAvailableSlots - Plus utilisé
  async getAvailableSlots(id_medecin, date, duree = 30) {
    throw new Error('Cette fonctionnalité a été supprimée. Utilisez checkAvailability ou quickCheck pour vérifier la disponibilité d\'un créneau spécifique.');
  }

  // Méthodes désactivées - Fonctionnalités non supportées
  async getStatutMedecins() {
    throw new Error('Cette fonctionnalité n\'est plus supportée. Utilisez le service médecin à la place.');
  }

  async declarerOccupation(data) {
    throw new Error('Cette fonctionnalité n\'est plus supportée avec la nouvelle structure.');
  }

  async terminerOccupation(id) {
    throw new Error('Cette fonctionnalité n\'est plus supportée avec la nouvelle structure.');
  }
}

export const rendezvousService = new RendezVousService();
export default rendezvousService;