import React, { useState, useCallback } from 'react';
import { 
  Modal, 
  Button, 
  Row, 
  Col, 
  Badge, 
  Card, 
  Alert,
  ListGroup,
  Spinner,
  Dropdown
} from 'react-bootstrap';
import { 
  BsClock,
  BsPerson,
  BsTelephone,
  BsEnvelope,
  BsCalendar,
  BsThreeDotsVertical,
  BsCheckCircle,
  BsXCircle,
  BsPlayCircle,
  BsPencil
} from 'react-icons/bs';
import { rendezvousService } from '../../services/rendezVousService';

const RendezVousDetails = ({ 
  show, 
  onHide, 
  rendezVous, 
  onRendezVousUpdate,
  onStatusChange,
  userRole = 'assistant'
}) => {
  const [annulationLoading, setAnnulationLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [annulationError, setAnnulationError] = useState('');

  const formatDateHeure = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return '-';
    }
  }, []);

  const formatHeureOnly = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur formatage heure:', error);
      return '-';
    }
  }, []);

  const getDureeRendezVous = useCallback(() => {
    return rendezVous?.duree ? `${rendezVous.duree} minutes` : '30 minutes';
  }, [rendezVous?.duree]);

  const getStatutBadge = useCallback((statut) => {
    const variants = {
      'planifie': { bg: 'warning', text: 'Planifié', icon: <BsCalendar className="me-1" /> },
      'en_cours': { bg: 'info', text: 'En Cours', icon: <BsPlayCircle className="me-1" /> },
      'termine': { bg: 'success', text: 'Terminé', icon: <BsCheckCircle className="me-1" /> },
      'annule': { bg: 'danger', text: 'Annulé', icon: <BsXCircle className="me-1" /> }
    };

    const config = variants[statut] || { bg: 'secondary', text: statut, icon: null };

    return (
      <Badge bg={config.bg} className="d-flex align-items-center">
        {config.icon}
        {config.text}
      </Badge>
    );
  }, []);

  const isAnnulable = useCallback(() => {
    return rendezVous?.statut === 'planifie' || rendezVous?.statut === 'en_cours';
  }, [rendezVous?.statut]);

  const isEditable = useCallback(() => {
    return rendezVous?.statut === 'planifie' && userRole !== 'patient';
  }, [rendezVous?.statut, userRole]);

  const getProchainRendezVousInfo = useCallback(() => {
    if (rendezVous?.statut !== 'planifie') return null;
    
    const maintenant = new Date();
    const dateRdv = new Date(rendezVous.date_heure);
    const difference = dateRdv - maintenant;
    
    if (difference < 0) {
      return 'Déjà passé';
    }
    
    const heuresRestantes = Math.floor(difference / (1000 * 60 * 60));
    const minutesRestantes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    if (heuresRestantes < 1) {
      return `Dans ${minutesRestantes} minute${minutesRestantes > 1 ? 's' : ''}`;
    } else if (heuresRestantes < 24) {
      return `Dans ${heuresRestantes} heure${heuresRestantes > 1 ? 's' : ''}`;
    } else {
      const joursRestants = Math.floor(heuresRestantes / 24);
      return `Dans ${joursRestants} jour${joursRestants > 1 ? 's' : ''}`;
    }
  }, [rendezVous?.statut, rendezVous?.date_heure]);

  const getMedecinSpecialite = useCallback(() => {
    return rendezVous?.medecin_specialite || 'Généraliste';
  }, [rendezVous?.medecin_specialite]);

  const getPatientContact = useCallback(() => {
    const tel = rendezVous?.patient_telephone;
    const email = rendezVous?.patient_email;
    
    if (tel && email) {
      return (
        <div className="d-flex flex-column">
          <small className="d-flex align-items-center gap-1">
            <BsTelephone size={12} />
            {tel}
          </small>
          <small className="d-flex align-items-center gap-1">
            <BsEnvelope size={12} />
            {email}
          </small>
        </div>
      );
    } else if (tel) {
      return (
        <small className="d-flex align-items-center gap-1">
          <BsTelephone size={12} />
          {tel}
        </small>
      );
    } else if (email) {
      return (
        <small className="d-flex align-items-center gap-1">
          <BsEnvelope size={12} />
          {email}
        </small>
      );
    }
    return 'Non disponible';
  }, [rendezVous?.patient_telephone, rendezVous?.patient_email]);

  const handleAnnulation = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    setAnnulationLoading(true);
    setAnnulationError('');

    try {
      const raison = prompt('Veuillez saisir la raison de l\'annulation :', 'Annulation par l\'administrateur');
      
      if (!raison || raison.trim() === '') {
        setAnnulationError('La raison de l\'annulation est requise');
        setAnnulationLoading(false);
        return;
      }

      await rendezvousService.annuler(rendezVous.id_rendez_vous, raison.trim());
      
      if (onRendezVousUpdate) {
        onRendezVousUpdate();
      }
      onHide();
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'annulation';
      setAnnulationError(errorMessage);
    } finally {
      setAnnulationLoading(false);
    }
  };

  const handleStatusChange = useCallback(async (nouveauStatut) => {
    if (!onStatusChange) return;
    
    setStatusLoading(true);
    try {
      await onStatusChange(rendezVous, nouveauStatut);
      onHide(); // Fermer la modal après changement de statut
    } catch (error) {
      console.error('Erreur changement statut:', error);
    } finally {
      setStatusLoading(false);
    }
  }, [onStatusChange, rendezVous, onHide]);

  const getStatusOptions = useCallback(() => {
    const statuses = [
      { value: 'planifie', label: 'Planifié', icon: <BsCalendar />, variant: 'warning' },
      { value: 'en_cours', label: 'En Cours', icon: <BsPlayCircle />, variant: 'info' },
      { value: 'termine', label: 'Terminé', icon: <BsCheckCircle />, variant: 'success' },
      { value: 'annule', label: 'Annulé', icon: <BsXCircle />, variant: 'danger' }
    ];

    return statuses
      .filter(status => status.value !== rendezVous?.statut)
      .map(status => (
        <Dropdown.Item 
          key={status.value}
          onClick={() => handleStatusChange(status.value)}
          className="d-flex align-items-center gap-2"
          disabled={statusLoading}
        >
          <Badge bg={status.variant} className="me-2">
            {status.icon}
          </Badge>
          {status.label}
        </Dropdown.Item>
      ));
  }, [rendezVous?.statut, handleStatusChange, statusLoading]);

  if (!rendezVous) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title>Détails non disponibles</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <Alert variant="warning">
            <h5>Rendez-vous introuvable</h5>
            <p className="mb-0">Les données du rendez-vous ne sont pas disponibles.</p>
          </Alert>
        </Modal.Body>
        <Modal.Footer className="bg-light border-top">
          <Button variant="primary" onClick={onHide}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const prochainRdvInfo = getProchainRendezVousInfo();
  const isRdvToday = new Date(rendezVous.date_heure).toDateString() === new Date().toDateString();

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="d-flex align-items-center gap-2 w-100">
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            <BsCalendar className="text-primary" />
            <span>Détails du Rendez-vous</span>
            {getStatutBadge(rendezVous.statut)}
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-0">
        {/* Alertes */}
        <div className="p-3 pb-0">
          {annulationError && (
            <Alert variant="danger" className="mb-3">
              {annulationError}
            </Alert>
          )}

          {prochainRdvInfo && (
            <Alert variant={prochainRdvInfo === 'Déjà passé' ? 'warning' : 'info'} className="mb-3">
              <div className="d-flex align-items-center gap-2">
                <BsClock />
                <strong>
                  {prochainRdvInfo === 'Déjà passé' ? 'Rendez-vous déjà passé' : `Prochain rendez-vous: ${prochainRdvInfo}`}
                </strong>
              </div>
            </Alert>
          )}

          {isRdvToday && rendezVous.statut === 'planifie' && (
            <Alert variant="success" className="mb-3">
              <div className="d-flex align-items-center gap-2">
                <BsCalendar />
                <strong>Rendez-vous prévu aujourd'hui</strong>
              </div>
            </Alert>
          )}
        </div>

        {/* Carte unique avec toutes les informations */}
        <Card className="border-0 rounded-0">
          <Card.Body className="p-3">
            <Row className="g-3">
              {/* Informations Générales */}
              <Col xs={12}>
                <div className="border-bottom pb-3">
                  <h6 className="text-primary mb-3 d-flex align-items-center gap-2">
                    <BsClock />
                    <strong>Informations Générales</strong>
                  </h6>
                  <Row>
                    <Col md={6}>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-2">
                          <span className="fw-semibold text-muted">Date et heure:</span>
                          <span className="text-end">{formatDateHeure(rendezVous.date_heure)}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-2">
                          <span className="fw-semibold text-muted">Durée estimée:</span>
                          <Badge bg="light" text="dark">{getDureeRendezVous()}</Badge>
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                    <Col md={6}>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-2">
                          <span className="fw-semibold text-muted">Statut:</span>
                          {getStatutBadge(rendezVous.statut)}
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-2">
                          <span className="fw-semibold text-muted">ID:</span>
                          <Badge bg="light" text="dark">#{rendezVous.id_rendez_vous}</Badge>
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* Informations Patient et Médecin */}
              <Col xs={12}>
                <Row className="g-3">
                  {/* Informations Patient */}
                  <Col md={6}>
                    <div className="border rounded p-3 h-100">
                      <h6 className=" mb-3 d-flex align-items-center gap-2">
                        <BsPerson />
                        <strong>Informations Patient</strong>
                      </h6>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-1">
                          <span className="fw-semibold text-muted">Nom complet:</span>
                          <span className="text-end">{rendezVous.patient_prenom} {rendezVous.patient_nom}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-1">
                          <span className="fw-semibold text-muted">ID Patient:</span>
                          <Badge bg="light" text="dark">{rendezVous.id_patient}</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-start border-0 px-0 py-1">
                          <span className="fw-semibold text-muted">Contact:</span>
                          <div className="text-end">
                            {getPatientContact()}
                          </div>
                        </ListGroup.Item>
                      </ListGroup>
                    </div>
                  </Col>

                  {/* Informations Médecin */}
                  <Col md={6}>
                    <div className="border rounded p-3 h-100">
                      <h6 className=" mb-3">
                        <strong>Informations Médecin</strong>
                      </h6>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-1">
                          <span className="fw-semibold text-muted">Médecin:</span>
                          <span className="text-end">Dr {rendezVous.medecin_prenom} {rendezVous.medecin_nom}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-1">
                          <span className="fw-semibold text-muted">ID Médecin:</span>
                          <Badge bg="light" text="dark">{rendezVous.id_medecin}</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 px-0 py-1">
                          <span className="fw-semibold text-muted">Spécialité:</span>
                          <Badge>{getMedecinSpecialite()}</Badge>
                        </ListGroup.Item>
                      </ListGroup>
                    </div>
                  </Col>
                </Row>
              </Col>

              {/* Motif de Consultation */}
              <Col xs={12}>
                <div className="border rounded p-3">
                  <h6 className=" mb-3">
                    <strong>Motif de Consultation</strong>
                  </h6>
                  <div className="p-3 bg-light rounded">
                    {rendezVous.motif ? (
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                        {rendezVous.motif}
                      </p>
                    ) : (
                      <p className="text-muted mb-0 fst-italic">
                        Aucun motif spécifié pour cette consultation
                      </p>
                    )}
                  </div>
                </div>
              </Col>

              {/* Informations d'annulation si annulé */}
              {rendezVous.statut === 'annule' && rendezVous.motif?.includes('Annulation:') && (
                <Col xs={12}>
                  <div className="border border-danger rounded p-3">
                    <h6 className="text-danger mb-3">
                      <strong>Informations d'Annulation</strong>
                    </h6>
                    <Row>
                      <Col md={12}>
                        <div className="mb-2">
                          <strong className="text-muted">Raison:</strong>
                          <p className="mb-0 mt-1 text-danger">
                            {rendezVous.motif.split('Annulation:')[1]?.trim() || 'Non spécifiée'}
                          </p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer className="bg-light border-top">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div className="d-flex">
            <Button variant="secondary" onClick={onHide}>
              Fermer
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default React.memo(RendezVousDetails);