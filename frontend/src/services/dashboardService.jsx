import { apiService } from './api';

class DashboardService {
  
  async getStats() {
    try {
      const res = await apiService.get('/api/dashboard/stats');
      return res.data || res;
    } catch (error) {
      console.error(' DashboardService.getStats - Erreur:', error);
      throw error;
    }
  }

  async getTodayAppointments() {
    try {
      const res = await apiService.get('/api/dashboard/rendezvous/aujourdhui');
      return res.data || res;
    } catch (error) {
      console.error(' DashboardService.getTodayAppointments - Erreur:', error);
      throw error;
    }
  }

  async getRecentPrescriptions() {
    try {
      const res = await apiService.get('/api/dashboard/ordonnances/recentes');
      return res.data || res;
    } catch (error) {
      console.error(' DashboardService.getRecentPrescriptions - Erreur:', error);
      throw error;
    }
  }

  async getAllDashboardData() {
    try {
      const [stats, appointments, prescriptions] = await Promise.all([
        this.getStats(),
        this.getTodayAppointments(),
        this.getRecentPrescriptions()
      ]);

      return {
        stats: stats.data || stats,
        appointments: appointments.data || appointments,
        prescriptions: prescriptions.data || prescriptions
      };
    } catch (error) {
      console.error(' DashboardService.getAllDashboardData - Erreur:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;