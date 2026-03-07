import React from 'react';
import { Modal, Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { 
  BsPerson, 
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsStar,
  BsPersonVcard,
  BsClock
} from 'react-icons/bs';

const MedecinDetails = ({ show, onHide, medecin }) => {
  if (!medecin) return null;

  const getDisponibiliteBadgeVariant = (disponibilite) => {
    switch (disponibilite) {
      case 'disponible': return 'success';
      case 'en_consultation': return 'warning';
      case 'pause': return 'info';
      case 'chirurgie': return 'danger';
      case 'hors_service': return 'secondary';
      default: return 'light';
    }
  };

  const getDisponibiliteText = (disponibilite) => {
    switch (disponibilite) {
      case 'disponible': return 'Disponible';
      case 'en_consultation': return 'En consultation';
      case 'pause': return 'Pause';
      case 'chirurgie': return 'En chirurgie';
      case 'hors_service': return 'Hors service';
      default: return disponibilite;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <BsPersonVcard className="me-2 fs-2" />
          Fiche Médecin
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Card className="border shadow-sm">
          <Card.Header className="text-bold">
            <h6 className="mb-3">
              <BsPerson className="me-2" />
              Informations du Médecin
            </h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6 className="text-primary mb-3">
                  Informations Professionnelles
                </h6>
                
                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <strong>Nom :</strong>
                  </Col>
                  <Col sm={7}>{medecin.nom || '-'}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <strong>Prénom :</strong>
                  </Col>
                  <Col sm={7}>{medecin.prenom || '-'}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <strong>Spécialité :</strong>
                  </Col>
                  <Col sm={7}>
                    {medecin.specialite ? (
                      <Badge bg="info">{medecin.specialite}</Badge>
                    ) : (
                      '-'
                    )}
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <strong>Disponibilité :</strong>
                  </Col>
                  <Col sm={7}>
                    <Badge bg={getDisponibiliteBadgeVariant(medecin.disponibilite)}>
                      {getDisponibiliteText(medecin.disponibilite)}
                    </Badge>
                  </Col>
                </Row>
              </Col>

              <Col md={6}>
                <h6 className="text-primary mb-3">
                  Coordonnées
                </h6>
                
                <Row className="mb-3">
                  <Col sm={5} className="d-flex align-items-center">
                    <BsTelephone className="me-2 text-muted" />
                    <strong>Téléphone :</strong>
                  </Col>
                  <Col sm={7}>
                    {medecin.telephone ? (
                      <span className="">{medecin.telephone}</span>
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
                    {medecin.email ? (
                      <span className="">{medecin.email}</span>
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
                        {medecin.adresse ? (
                          <span>{medecin.adresse}</span>
                        ) : (
                          <Badge bg="secondary">Non renseignée</Badge>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Modal.Body>
      
      <Modal.Footer className="bg-light">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <small className="text-muted">
            <BsPerson className="me-1" />
            Médecin {medecin.specialite ? `- ${medecin.specialite}` : ''}
          </small>
          <Button variant="secondary" onClick={onHide}>
            Fermer
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default MedecinDetails;