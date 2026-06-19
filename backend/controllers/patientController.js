const PatientModel = require('../models/patientModel');

class PatientController {
  async create(req, res) {
    try {
      
      const { nom, prenom, date_naissance, sexe } = req.body;

      if (!nom || !prenom || !date_naissance || !sexe) {
        return res.status(400).json({
          success: false,
          message: 'Les champs nom, prenom, date_naissance et sexe sont obligatoires'
        });
      }

      const newPatient = await PatientModel.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Patient créé avec succès',
        data: newPatient
      });

    } catch (err) {
      console.error(' Erreur création patient:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la création du patient',
        error: err.message 
      });
    }
  }

  // Obtenir tous les patients
  async getAll(req, res) {
    try {
      const patients = await PatientModel.getAll();
      
      res.json({
        success: true,
        message: 'Patients récupérés avec succès',
        data: patients,
        count: patients.length
      });
    } catch (err) {
      console.error(' Erreur récupération patients:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des patients',
        error: err.message 
      });
    }
  }

  // Obtenir un patient par ID
  async getById(req, res) {
    try {
      const id = req.params.id;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du patient invalide'
        });
      }

      const patient = await PatientModel.getById(id);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'Patient récupéré avec succès',
        data: patient
      });

    } catch (err) {
      console.error(' Erreur récupération patient:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération du patient',
        error: err.message 
      });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du patient invalide'
        });
      }

      const { nom, prenom, date_naissance, sexe } = req.body;

      if (!nom || !prenom || !date_naissance || !sexe) {
        return res.status(400).json({
          success: false,
          message: 'Les champs nom, prenom, date_naissance et sexe sont obligatoires'
        });
      }

      const updatedPatient = await PatientModel.update(id, req.body);
      
      if (!updatedPatient) {
        return res.status(404).json({
          success: false,
          message: 'Patient non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'Patient mis à jour avec succès',
        data: updatedPatient
      });

    } catch (err) {
      console.error(' Erreur mise à jour patient:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la mise à jour du patient',
        error: err.message 
      });
    }
  }

  // Supprimer un patient
  async delete(req, res) {
    try {
      const id = req.params.id;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID du patient invalide'
        });
      }

      const deleted = await PatientModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Patient non trouvé'
        });
      }
      res.json({
        success: true,
        message: 'Patient supprimé avec succès'
      });

    } catch (err) {
      console.error(' Erreur suppression patient:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la suppression du patient',
        error: err.message 
      });
    }
  }

  // Recherche de patients
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Le terme de recherche doit contenir au moins 2 caractères'
        });
      }

      const patients = await PatientModel.search(q.trim());
      
      res.json({
        success: true,
        message: 'Recherche effectuée avec succès',
        data: patients,
        count: patients.length
      });

    } catch (err) {
      console.error(' Erreur recherche patients:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la recherche',
        error: err.message 
      });
    }
  }

  // Obtenir les statistiques
  async getStats(req, res) {
    try {

      const stats = await PatientModel.getStats();
      
      res.json({
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: stats
      });

    } catch (err) {
      console.error(' Erreur statistiques patients:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: err.message 
      });
    }
  }

  // Obtenir les tuteurs potentiels
  async getTuteursPotentiels(req, res) {
    try {

      const tuteurs = await PatientModel.getTuteursPotentiels();
      
      res.json({
        success: true,
        message: 'Tuteurs potentiels récupérés avec succès',
        data: tuteurs
      });

    } catch (err) {
      console.error(' Erreur tuteurs potentiels:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des tuteurs potentiels',
        error: err.message 
      });
    }
  }

  // Obtenir les patients par tuteur
  async getByTuteur(req, res) {
    try {
      const { tuteurId } = req.params;
      
      if (!tuteurId || isNaN(tuteurId)) {
        return res.status(400).json({
          success: false,
          message: 'ID du tuteur invalide'
        });
      }

      const patients = await PatientModel.getByTuteur(tuteurId);
      
      res.json({
        success: true,
        message: 'Patients du tuteur récupérés avec succès',
        data: patients
      });

    } catch (err) {
      console.error(' Erreur patients par tuteur:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des patients du tuteur',
        error: err.message 
      });
    }
  }

  // Obtenir les patients avec dernier rendez-vous
  async getPatientsAvecDernierRV(req, res) {
    try {
      
      const patients = await PatientModel.getPatientsAvecDernierRV();
      
      res.json({
        success: true,
        message: 'Patients avec dernier RV récupérés avec succès',
        data: patients
      });

    } catch (err) {
      console.error(' Erreur patients avec dernier RV:', err);
      res.status(500).json({ 
        success: false,
        message: 'Erreur lors de la récupération des patients avec dernier RV',
        error: err.message 
      });
    }
  }
}

module.exports = new PatientController();