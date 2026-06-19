import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Card, 
  Form, 
  Button, 
  Row, 
  Col, 
  Alert, 
  Spinner,
  Breadcrumb
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { BsArrowLeft, BsCalendar, BsClock, BsHourglass, BsPeople, BsPerson } from 'react-icons/bs';
import patientService from '../../services/patientService';
import medecinService from '../../services/medecinService';
import { rendezvousService } from '../../services/rendezVousService';


const initialState = {
  id_patient: '',
  id_medecin: '',
  date_rendez_vous: '',
  heure_rendez_vous: '',
  motif: '',
  statut: 'planifie',
};

const DUREE_RDV_MINUTES = 30;

let patientsCache = null;
let medecinsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000;

const RendezVousForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [availabilityError, setAvailabilityError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState('assistant');
  const [stats, setStats] = useState({
    total: 0,
    aujourdhui: 0,
    en_attente: 0
  });

  // Debug des données
  useEffect(() => {
    console.log('🔍 Debug formData:', {
      id_medecin: formData.id_medecin,
      type_id_medecin: typeof formData.id_medecin,
      id_patient: formData.id_patient,
      type_id_patient: typeof formData.id_patient,
      medecins_count: medecins.length,
      patients_count: patients.length
    });


    if (medecins.length > 0) {
      console.log(' Médecins disponibles:', medecins.map(m => ({
        id: m.id_medecin,
        nom: `${m.prenom} ${m.nom}`,
        specialite: m.specialite
      })));
    }
  }, [formData.id_medecin, formData.id_patient, medecins, patients]);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'assistant';
    setUserRole(role);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await rendezvousService.getDashboardStats();
      setStats({
        total: statsData.total || 0,
        aujourdhui: statsData.aujourdhui || 0,
        en_attente: statsData.en_attente || 0
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setStats({ total: 0, aujourdhui: 0, en_attente: 0 });
    }
  }, []);

  // Chargement des données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      // Charger patients et médecins
      const now = Date.now();
      if (patientsCache && medecinsCache && (now - cacheTimestamp < CACHE_DURATION)) {
        setPatients(patientsCache);
        setMedecins(medecinsCache);
      } else {
        try {
          const [patientsData, medecinsData] = await Promise.all([
            patientService.getAll(),
            medecinService.getAll()
          ]);

          const patientsList = Array.isArray(patientsData) ? patientsData : 
                             patientsData?.data || patientsData || [];
          const medecinsList = Array.isArray(medecinsData) ? medecinsData : 
                              medecinsData?.data || medecinsData || [];
          
          patientsCache = patientsList;
          medecinsCache = medecinsList;
          cacheTimestamp = now;
          
          setPatients(patientsList);
          setMedecins(medecinsList);
        } catch (error) {
          console.error('Erreur chargement patients/médecins:', error);
          setPatients([]);
          setMedecins([]);
        }
      }

      if (id) {
        try {
          setLoading(true);
          const rdv = await rendezvousService.getById(id);
          
          console.log(' Rendez-vous chargé pour édition:', rdv);
          
          const dateObj = new Date(rdv.date_heure);
          const date = dateObj.toISOString().split('T')[0];
          const time = dateObj.toTimeString().slice(0, 5);
          
          setFormData({
            id_patient: rdv.id_patient?.toString() || '',
            id_medecin: rdv.id_medecin?.toString() || '',
            date_rendez_vous: date,
            heure_rendez_vous: time,
            motif: rdv.motif || '',
            statut: rdv.statut || 'planifie',
          });
          setIsEditing(true);

        console.log('Mode édition - Données chargées:',
         {
            id_patient: rdv.id_patient,
            id_medecin: rdv.id_medecin
          });
        } catch (error) {
          console.error('Erreur chargement rendez-vous:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    console.log(`Champ ${name} changé:`, value, `Type: ${typeof value}`);
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (availabilityError && (name === 'id_medecin' || name === 'date_rendez_vous' || name === 'heure_rendez_vous')) {
      setAvailabilityError('');
    }
  }, [errors, availabilityError]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    console.log(' Validation formulaire avec:', formData);
    
    if (!formData.id_patient || formData.id_patient === '') {
      newErrors.id_patient = 'Le patient est requis';
      console.log(' Patient non sélectionné');
    }
    
    if (!formData.id_medecin || formData.id_medecin === '') {
      newErrors.id_medecin = 'Le médecin est requis';
      console.log(' Médecin non sélectionné');
    }
    
    if (!formData.date_rendez_vous) newErrors.date_rendez_vous = 'La date du rendez-vous est requise';
    if (!formData.heure_rendez_vous) newErrors.heure_rendez_vous = "L'heure du rendez-vous est requise";
    if (!formData.motif?.trim()) newErrors.motif = 'Le motif est requis';
    if (formData.id_medecin && formData.id_medecin !== '') {
      const medecinId = parseInt(formData.id_medecin);
      if (isNaN(medecinId) || medecinId <= 0) {
        newErrors.id_medecin = 'ID du médecin invalide';
        console.log(' ID médecin invalide:', formData.id_medecin);
      }
    }

    if (formData.id_patient && formData.id_patient !== '') {
      const patientId = parseInt(formData.id_patient);
      if (isNaN(patientId) || patientId <= 0) {
        newErrors.id_patient = 'ID du patient invalide';
        console.log(' ID patient invalide:', formData.id_patient);
      }
    }
    
    if (formData.date_rendez_vous) {
      const selectedDate = new Date(formData.date_rendez_vous);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date_rendez_vous = 'Impossible de prendre rendez-vous dans le passé';
      }
      
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        newErrors.date_rendez_vous = 'Le centre est fermé le week-end';
      }
    }

    // Validation de l'heure
    if (formData.heure_rendez_vous) {
      const heureRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!heureRegex.test(formData.heure_rendez_vous)) {
        newErrors.heure_rendez_vous = "Format d'heure invalide (HH:MM)";
      } else {
        const [heures, minutes] = formData.heure_rendez_vous.split(':').map(Number);
        const totalMinutes = heures * 60 + minutes;
        const matinDebut = 7 * 60 + 30; 
        const matinFin = 12 * 60;       
        const apresMidiDebut = 14 * 60; 
        const apresMidiFin = 17 * 60 + 30; 
        
        const dansMatin = totalMinutes >= matinDebut && totalMinutes <= matinFin;
        const dansApresMidi = totalMinutes >= apresMidiDebut && totalMinutes <= apresMidiFin;
        
        if (!dansMatin && !dansApresMidi) {
          newErrors.heure_rendez_vous = "Hors des horaires de travail (07:30-12:00 / 14:00-17:30)";
        }
      }
    }
    
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    
    return isValid;
  }, [formData]);

  const checkAvailability = useCallback(async () => {
    if (!formData.id_medecin || !formData.date_rendez_vous || !formData.heure_rendez_vous) {
      return false;
    }

    // Vérifier que l'ID médecin est valide
    const medecinId = parseInt(formData.id_medecin);
    if (isNaN(medecinId) || medecinId <= 0) {
      console.error(' ID médecin invalide:', formData.id_medecin);
      setAvailabilityError('ID du médecin invalide. Veuillez sélectionner un médecin valide.');
      return false;
    }

    try {
      const dateTimeString = `${formData.date_rendez_vous}T${formData.heure_rendez_vous}:00`;
      
      console.log(' Vérification disponibilité:', {
        medecinId,
        dateTimeString,
        isEditing,
        id
      });

      const availability = await rendezvousService.checkAvailability({
        id_medecin: medecinId,
        date_heure: dateTimeString,
        duree: DUREE_RDV_MINUTES,
        excludeRdvId: isEditing ? id : null
      });


      if (!availability.disponible) {
        let errorMessage = 'Créneau non disponible';
        
        if (availability.raison) {
          if (availability.raison.includes('Médecin actuellement')) {
            errorMessage = availability.raison;
          } else if (availability.raison.includes('occupé')) {
            errorMessage = `Le médecin est déjà occupé à cette heure-ci`;
          } else if (availability.raison.includes('déjà un rendez-vous')) {
            errorMessage = `Il y a déjà un rendez-vous programmé à cette heure pour ce médecin`;
          } else if (availability.raison.includes('Hors des horaires')) {
            errorMessage = availability.raison;
          } else if (availability.raison.includes('fermé')) {
            errorMessage = availability.raison;
          } else {
            errorMessage = availability.raison;
          }
        }
        
        setAvailabilityError(errorMessage);
        return false;
      }

      setAvailabilityError('');
      return true;
    } catch (err) {
      console.error(' Erreur vérification disponibilité:', err);
      
      // Gestion spécifique des erreurs de disponibilité
      if (err.response?.data?.message) {
        const serverMessage = err.response.data.message;
        
        if (serverMessage.includes('Médecin actuellement')) {
          setAvailabilityError(serverMessage);
        } else if (serverMessage.includes('occupé')) {
          setAvailabilityError(`Le médecin est déjà occupé à cette heure-ci`);
        } else if (serverMessage.includes('déjà un rendez-vous')) {
          setAvailabilityError('Il y a déjà un rendez-vous programmé à cette heure pour ce médecin');
        } else if (serverMessage.includes('ID du médecin invalide')) {
          setAvailabilityError('ID du médecin invalide. Veuillez sélectionner un médecin valide.');
        } else {
          setAvailabilityError(serverMessage);
        }
      } else if (err.message?.includes('Médecin actuellement')) {
        setAvailabilityError(err.message);
      } else if (err.message?.includes('ID du médecin invalide')) {
        setAvailabilityError('ID du médecin invalide. Veuillez sélectionner un médecin valide.');
      } else {
        setAvailabilityError('Impossible de vérifier la disponibilité. Veuillez réessayer.');
      }
      return false;
    }
  }, [formData, isEditing, id]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    console.log(' Début soumission formulaire');
    console.log(' Données du formulaire:', formData);
    
    if (!validateForm()) {
      console.log(' Validation formulaire échouée');
      return;
    }

    console.log(' Validation formulaire réussie');

    const available = await checkAvailability();
    if (!available) {
      console.log(' Disponibilité vérifiée: non disponible');
      return;
    }

    console.log(' Disponibilité vérifiée: disponible');
    const dateTimeString = `${formData.date_rendez_vous}T${formData.heure_rendez_vous}:00`;
    
    const submitData = {
      id_patient: parseInt(formData.id_patient),
      id_medecin: parseInt(formData.id_medecin),
      date_heure: dateTimeString,
      motif: formData.motif.trim(),
      statut: formData.statut,
      duree: DUREE_RDV_MINUTES
    };

    
    try {
      setLoading(true);
      if (isEditing) {
        await rendezvousService.update(id, submitData);
      } else {
        await rendezvousService.create(submitData);
      }
      
      navigate('/rendez-vous');
    } catch (error) {
      console.error(' Erreur soumission:', error);
      
      if (error.response?.data?.message) {
        const serverMessage = error.response.data.message;
        
        if (serverMessage.includes('Médecin actuellement')) {
          setAvailabilityError(serverMessage);
        } else if (serverMessage.includes('occupé')) {
          setAvailabilityError(`Le médecin est déjà occupé à cette heure-ci`);
        } else if (serverMessage.includes('déjà un rendez-vous')) {
          setAvailabilityError('Il y a déjà un rendez-vous programmé à cette heure pour ce médecin');
        } else if (serverMessage.includes('Non disponible')) {
          setAvailabilityError('Ce créneau horaire n\'est pas disponible');
        } else if (serverMessage.includes('ID du médecin invalide')) {
          setAvailabilityError('ID du médecin invalide. Veuillez sélectionner un médecin valide.');
        } else {
          setAvailabilityError(serverMessage);
        }
      } else if (error.message?.includes('Médecin actuellement')) {
        setAvailabilityError(error.message);
      } else if (error.message?.includes('ID du médecin invalide')) {
        setAvailabilityError('ID du médecin invalide. Veuillez sélectionner un médecin valide.');
      } else {
        setAvailabilityError('Erreur lors de l\'enregistrement. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, checkAvailability, isEditing, id, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/rendez-vous');
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    loadStats();
  }, [loadStats]);

  const getMinDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  return (
    <div className="bg-light min-vh-100">

      <Container fluid className="p-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item onClick={() => navigate('/rendez-vous')} style={{ cursor: 'pointer' }}>
            Rendez-vous
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {isEditing ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row className="justify-content-center">
          <Col xl={10}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={handleCancel}
                      className="me-3"
                    >
                      <BsArrowLeft size={16} />
                    </Button>
                    <div>
                      <h4 className="mb-0">
                        {isEditing ? 'Modifier le Rendez-vous' : 'Nouveau Rendez-vous'}
                      </h4>
                      <small className="text-muted">
                        {isEditing 
                          ? 'Modifier les informations du rendez-vous' 
                          : 'Créer un nouveau rendez-vous pour un patient'
                        }
                      </small>
                    </div>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {availabilityError && (
                    <Alert variant="danger" className="mb-4">
                      <strong>Indisponibilité détectée:</strong> {availabilityError}
                    </Alert>
                  )}

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          Patient 
                        </Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsPeople size={28}/></span>
                        <Form.Select
                          name="id_patient"
                          value={formData.id_patient}
                          onChange={handleInputChange}
                          isInvalid={!!errors.id_patient}
                          style={{fontSize :'18px'}}
                        >
                          <option value="" style={{fontSize :'18px'}}>Sélectionner un patient</option>
                          {patients.map(p => (
                            <option key={p.id_patient} value={p.id_patient}>
                              {p.prenom} {p.nom} 
                            </option>
                          ))}
                        </Form.Select>
                        </div>
                        <Form.Control.Feedback type="invalid">
                          {errors.id_patient}
                        </Form.Control.Feedback>
                        {patients.length === 0 && (
                          <Form.Text className="text-danger">
                            Aucun patient disponible
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          Médecin 
                        </Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsPerson size={28}/></span>
                        <Form.Select
                          name="id_medecin"
                          value={formData.id_medecin}
                          onChange={handleInputChange}
                          isInvalid={!!errors.id_medecin}
                          style={{fontSize :'18px'}}
                        >
                          <option value="" style={{fontSize :'18px'}}>Sélectionner un médecin</option>
                          {medecins.map(m => (
                            <option key={m.id_medecin} value={m.id_medecin}>
                              Dr {m.prenom} {m.nom} {m.specialite ? `(${m.specialite})` : ''}
                            </option>
                          ))}
                        </Form.Select>
                        </div>
                        <Form.Control.Feedback type="invalid">
                          {errors.id_medecin}
                        </Form.Control.Feedback>
                        {medecins.length === 0 && (
                          <Form.Text className="text-danger">
                            Aucun médecin disponible
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          Date du Rendez-vous
                        </Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsCalendar size={28}/></span>
                        <Form.Control
                          type="date"
                          name="date_rendez_vous"
                          value={formData.date_rendez_vous}
                          onChange={handleInputChange}
                          isInvalid={!!errors.date_rendez_vous}
                          min={getMinDate()}
                          style={{fontSize :'18px'}}
                        />
                        </div>
                        <Form.Control.Feedback type="invalid">
                          {errors.date_rendez_vous}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Lundi au Vendredi uniquement
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">
                          Heure du Rendez-vous 
                        </Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsClock size={28}/></span>
                        <Form.Control
                          type="time"
                          name="heure_rendez_vous"
                          value={formData.heure_rendez_vous}
                          onChange={handleInputChange}
                          isInvalid={!!errors.heure_rendez_vous}
                          placeholder="HH:MM"
                          step="300" 
                        />
                        
                        <Form.Control.Feedback type="invalid">
                          {errors.heure_rendez_vous}
                        </Form.Control.Feedback></div>
                        <Form.Text className="text-muted">
                          Format: HH:MM (ex: 09:30, 14:15) - Horaires: 07:30-12:00 / 14:00-17:30
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      Motif 
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="motif"
                      value={formData.motif}
                      onChange={handleInputChange}
                      isInvalid={!!errors.motif}
                      placeholder="Décrivez le motif de la consultation..."
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.motif}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {isEditing && (
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">Statut</Form.Label>
                      <Form.Select
                        name="statut"
                        value={formData.statut}
                        onChange={handleInputChange}
                      >
                        <option value="planifie">Planifié</option>
                        <option value="en_cours">En Cours</option>
                        <option value="termine">Terminé</option>
                        <option value="annule">Annulé</option>
                      </Form.Select>
                    </Form.Group>
                  )}

                  <Alert variant="info" className="mb-4">
                    <strong>Informations importantes:</strong><br/>
                    • Horaires de travail: 07:30-12:00 / 14:00-17:30<br/>
                    • Durée du rendez-vous: {DUREE_RDV_MINUTES} minutes<br/>
                    • La disponibilité du médecin est vérifiée automatiquement<br/>
                    • Un message d'erreur s'affichera si le créneau n'est pas disponible
                  </Alert>

                  <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleCancel}
                      size="lg"
                    >
                      Annuler
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      size="lg"
                      className="px-4"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Vérification...
                        </>
                      ) : (
                        isEditing ? 'Modifier le Rendez-vous' : 'Créer le Rendez-vous'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RendezVousForm;