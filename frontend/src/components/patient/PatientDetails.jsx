import React from 'react';
import { Modal, Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { 
  BsPerson, 
  BsCalendar, 
  BsGenderMale, 
  BsGenderFemale,
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsPeople,
  BsBriefcase,
  BsLink
} from 'react-icons/bs';

const PatientDetails = ({ show, onHide, patient }) => {
  if (!patient) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Badge pour le sexe
  const getSexeBadge = (sexe) => {
    return sexe === 'M' ? (
      <Badge bg="primary">
        <BsGenderMale className="me-1" />
        Masculin
      </Badge>
    ) : (
      <Badge bg="success">
        <BsGenderFemale className="me-1" />
        Féminin
      </Badge>
    );
  };

  // Badge pour le type de patient
  const getTypePatientBadge = () => {
    return patient.id_tuteur ? (
      <Badge bg="info">
        Membre de famille
      </Badge>
    ) : (
      <Badge bg="primary">
        Employé JIRAMA
      </Badge>
    );
  };

  // Badge pour le lien familial
  const getLienFamilialBadge = (lien) => {
    switch(lien) {
      case 'Conjoint':
        return <Badge bg="success">Conjoint</Badge>;
      case 'Enfant':
        return <Badge bg="warning" text="dark">Enfant</Badge>;
      default:
        return <Badge bg="secondary">{lien || 'Non spécifié'}</Badge>;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <BsPerson className="me-2" />
          Fiche Patient - {patient.nom} {patient.prenom}
          <div className="mt-2">
            {getTypePatientBadge()}
            {patient.lien_familial && (
              <span className="ms-2">{getLienFamilialBadge(patient.lien_familial)}</span>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Carte unique avec toutes les informations */}
        <Card className="border shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h6 className="mb-0">
              <BsPerson className="me-2" />
              Informations Complètes du Patient
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              {/* Colonne Informations Personnelles */}
              <Col md={6}>
                <h6 className="text-primary mb-3">
                  {/* Colonne Informations Personnelles<BsPerson className="me-2" /> */}
                  Informations Personnelles
                </h6>
                
                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <BsPerson className="me-2 text-muted" />
                    <strong>Nom :</strong>
                  </Col>
                  <Col sm={7}>{patient.nom || '-'}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <BsPerson className="me-2 text-muted" />
                    <strong>Prénom :</strong>
                  </Col>
                  <Col sm={7}>{patient.prenom || '-'}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <BsCalendar className="me-2 text-muted" />
                    <strong>Date Naissance :</strong>
                  </Col>
                  <Col sm={7}>{formatDate(patient.date_naissance)}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    {patient.sexe === 'M' ? (
                      <BsGenderMale className="me-2 text-muted" />
                    ) : (
                      <BsGenderFemale className="me-2 text-muted" />
                    )}
                    <strong>Sexe :</strong>
                  </Col>
                  <Col sm={7}>{getSexeBadge(patient.sexe)}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <BsBriefcase className="me-2 text-muted" />
                    <strong>Type :</strong>
                  </Col>
                  <Col sm={7}>{getTypePatientBadge()}</Col>
                </Row>
              </Col>

              {/* Colonne Coordonnées */}
              <Col md={6}>
                <h6 className="text-primary mb-3">
                  {/* Colonne Coordonnées<BsTelephone className="me-2" /> */}
                  Coordonnées
                </h6>
                
                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <BsTelephone className="me-2 text-muted" />
                    <strong>Téléphone :</strong>
                  </Col>
                  <Col sm={7}>
                    {patient.telephone ? (
                      <span className="text-primary">{patient.telephone}</span>
                    ) : (
                      <Badge bg="secondary">Non renseigné</Badge>
                    )}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <BsEnvelope className="me-2 text-muted" />
                    <strong>Email :</strong>
                  </Col>
                  <Col sm={7}>
                    {patient.email ? (
                      <span className="text-primary">{patient.email}</span>
                    ) : (
                      <Badge bg="secondary">Non renseigné</Badge>
                    )}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col className="d-flex">
                    <BsGeoAlt className="me-2 text-muted mt-1" />
                    <div>
                      <strong>Adresse :</strong>
                      <div className="mt-1">
                        {patient.adresse ? (
                          <span>{patient.adresse}</span>
                        ) : (
                          <Badge bg="secondary">Non renseignée</Badge>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Ligne séparatrice */}
            <hr className="my-4" />

            {/* Section Relations Familiales ou Statut Employé */}
            <Row>
              <Col>
                {patient.id_tuteur ? (
                  <>
                    <h6 className="text-primary mb-3">
                      <BsLink className="me-2" />
                      Lien Familial
                    </h6>
                    <Row>
                      <Col md={6}>
                        <Row className="mb-2">
                          <Col sm={5} className="d-flex align-items-center">
                            <BsPeople className="me-2 text-muted" />
                            <strong>Lien :</strong>
                          </Col>
                          <Col sm={7}>{getLienFamilialBadge(patient.lien_familial)}</Col>
                        </Row>
                      </Col>
                      <Col md={6}>
                        <Row className="mb-2">
                          <Col sm={5} className="d-flex align-items-center">
                            <BsPerson className="me-2 text-muted" />
                            <strong>ID Tuteur :</strong>
                          </Col>
                          <Col sm={7}>
                            <Badge bg="info">#{patient.id_tuteur}</Badge>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <div className="text-muted small mt-2">
                      {/* Ligne séparatrice <BsPeople className="me-1" />*/}
                      Ce patient est un membre de famille lié à un employé JIRAMA
                    </div>
                  </>
                ) : (
                  <>
                    <h6 className="text-primary mb-3">
                      <BsBriefcase className="me-2" />
                      Statut Employé JIRAMA
                    </h6>
                    <Row>
                      <Col md={6}>
                        <Row className="mb-2">
                          <Col sm={5} className="d-flex align-items-center">
                            <BsBriefcase className="me-2 text-muted" />
                            <strong>Type :</strong>
                          </Col>
                          <Col sm={7}>
                            <Badge bg="success">Employé Principal</Badge>
                          </Col>
                        </Row>
                      </Col>
                      <Col md={6}>
                        <Row className="mb-2">
                          <Col sm={5} className="d-flex align-items-center">
                            <BsPeople className="me-2 text-muted" />
                            <strong>Peut être tuteur :</strong>
                          </Col>
                          <Col sm={7}>
                            <Badge bg="success">Oui</Badge>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <div className="text-muted small mt-2">
                      <BsBriefcase className="me-1" />
                      Cet employé peut être désigné comme tuteur pour des membres de famille
                    </div>
                  </>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Modal.Body>
      
      <Modal.Footer className="bg-light">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <small className="text-muted">
            <BsPerson className="me-1" />
            Patient {patient.id_tuteur ? 'membre de famille' : 'employé JIRAMA'}
          </small>
          <Button variant="secondary" onClick={onHide}>
            Fermer
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default PatientDetails;