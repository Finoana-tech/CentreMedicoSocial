const PatientModel = require('../models/patientModel');
const MedecinModel = require('../models/medecinModel');
const RendezVousModel = require('../models/rendezVousModel');
const OrdonnanceModel = require('../models/ordonnanceModel');

class DashboardController {
  async getStats(req, res) {
    try {
      const stats = await RendezVousModel.getDashboardStats();
      
      const [
        totalPatients,
        totalMedecins,
        ordonnancesMois,
        medecinsActifs
      ] = await Promise.all([
        PatientModel.countPatients ? PatientModel.countPatients() : 0,
        MedecinModel.countMedecins ? MedecinModel.countMedecins() : 0,
        OrdonnanceModel.countOrdonnancesThisMonth ? OrdonnanceModel.countOrdonnancesThisMonth() : 0,
        MedecinModel.countMedecinsActifs ? MedecinModel.countMedecinsActifs() : 0
      ]);


      res.json({
        success: true,
        message: 'Statistiques du dashboard récupérées avec succès',
        data: {
          totalPatients: totalPatients || 0,
          totalMedecins: totalMedecins || 0,
          rdvAujourdhui: stats.aujourdhui || 0,
          ordonnancesMois: ordonnancesMois || 0,
          rdvEnAttente: stats.en_attente || 0,
          medecinsActifs: medecinsActifs || 0,
          occupations: stats.occupations || 0,
          cetteSemaine: stats.cette_semaine || 0,
          patientsMois: 12, 
          ordoSemaine: 8    
        }
      });

    } catch (err) {
      console.error('Erreur récupération statistiques:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: err.message
      });
    }
  }

  async getTodayAppointments(req, res) {
    try {
      console.log('GET /api/dashboard/rendezvous/aujourdhui - Début');

      const appointments = await RendezVousModel.getTodayAppointments();

      console.log(`${appointments.length} RDV du jour récupérés`);

      res.json({
        success: true,
        message: 'Rendez-vous du jour récupérés avec succès',
        data: appointments,
        count: appointments.length
      });

    } catch (err) {
      console.error('Erreur récupération RDV du jour:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des rendez-vous du jour',
        error: err.message
      });
    }
  }

  async getRecentPrescriptions(req, res) {
    try {
      console.log('GET /api/dashboard/ordonnances/recentes - Début');

      let prescriptions = [];
      if (OrdonnanceModel.getRecentOrdonnances) {
        prescriptions = await OrdonnanceModel.getRecentOrdonnances(5);
      } else if (OrdonnanceModel.getRecentPrescriptions) {
        prescriptions = await OrdonnanceModel.getRecentPrescriptions();
      }

      console.log(`${prescriptions.length} ordonnances récentes récupérées`);

      res.json({
        success: true,
        message: 'Ordonnances récentes récupérées avec succès',
        data: prescriptions,
        count: prescriptions.length
      });

    } catch (err) {
      console.error('Erreur récupération ordonnances récentes:', err);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des ordonnances récentes',
        error: err.message
      });
    }
  }
}

module.exports = new DashboardController();