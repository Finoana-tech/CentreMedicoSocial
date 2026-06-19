import React from 'react';
import { Modal, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { 
  BsCapsule, 
  BsTag, 
  BsClipboard, 
  BsBox, 
  BsExclamationTriangle,
  BsCheckCircle,
  BsFileText,
  BsThermometer,
  BsCalendar,
  BsInfoCircle
} from 'react-icons/bs';

const MedicamentDetails = ({ show, onHide, medicament }) => {
  if (!medicament) return null;

  const getStockBadge = () => {
    if (medicament.stock_actuel <= 0) {
      return <Badge bg="danger" className="fs-6 d-flex align-items-center gap-1"><BsExclamationTriangle /> Rupture de stock</Badge>;
    } else if (medicament.stock_actuel <= medicament.stock_minimum) {
      return <Badge bg="warning" text="dark" className="fs-6 d-flex align-items-center gap-1"><BsExclamationTriangle /> Stock critique</Badge>;
    } else {
      return <Badge bg="success" className="fs-6 d-flex align-items-center gap-1"><BsCheckCircle /> En stock</Badge>;
    }
  };

  const getPrescriptionBadge = () => {
    return medicament.prescription_restreinte 
      ? <Badge  className="fs-6 d-flex align-items-center gap-1"> <p>Ordonnance requise</p></Badge>
      : <Badge  className="fs-6 d-flex align-items-center gap-1"><BsCheckCircle /> <p>Vente libre</p></Badge>;
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="d-flex align-items-center gap-3">
          <BsCapsule className="text-primary" size={24} />
          <span className="text-dark">{medicament.nom_commercial}</span>
          {getStockBadge()}
          {getPrescriptionBadge()}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Row>
          {/* Colonne Informations Générales */}
          <Col md={6}>
            <Card className="h-100 border shadow-sm">
              <Card.Header className="bg-secondary text-white d-flex align-items-center gap-2">
                <BsInfoCircle />
                <h6 className="mb-0">Informations Générales</h6>
              </Card.Header>
              <Card.Body>
                <Row className="mb-2">
                  <Col sm={5} className="d-flex align-items-center gap-1">
                    <BsTag size={14} className="text-muted" />
                    <strong>ID Médicament:</strong>
                  </Col>
                  <Col sm={7}>
                    <Badge bg="secondary">#{medicament.id_medicament}</Badge>
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={5} className="d-flex align-items-center gap-1">
                    <BsCapsule size={14} className="text-muted" />
                    <strong>Nom Commercial:</strong>
                  </Col>
                  <Col sm={7} className="fw-bold text-primary">
                    {medicament.nom_commercial || '-'}
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={5} className="d-flex align-items-center gap-1">
                    <BsClipboard size={14} className="text-muted" />
                    <strong>Principe Actif:</strong>
                  </Col>
                  <Col sm={7}>{medicament.principe_actif || '-'}</Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={5} className="d-flex align-items-center gap-1">
                    <BsThermometer size={14} className="text-muted" />
                    <strong>Dosage:</strong>
                  </Col>
                  <Col sm={7}>
                    <Badge bg="primary">{medicament.dosage || '-'}</Badge>
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={5} className="d-flex align-items-center gap-1">
                    <BsTag size={14} className="text-muted" />
                    <strong>Classe Thérapeutique:</strong>
                  </Col>
                  <Col sm={7}>
                    {medicament.classe_therapeutique ? (
                      <Badge bg="primary" className="text-wrap">
                        {medicament.classe_therapeutique}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Colonne Gestion Stock & Prix */}
          <Col md={6}>
            <Card className="h-100 border shadow-sm">
              <Card.Header className="bg-secondary text-white d-flex align-items-center gap-2">
                <BsBox />
                <h6 className="mb-0">Gestion du Stock</h6>
              </Card.Header>
              <Card.Body>
                <Row className="mb-2">
                  <Col sm={6} className="d-flex align-items-center gap-1">
                    <BsBox size={14} className="text-muted" />
                    <strong>Stock Actuel:</strong>
                  </Col>
                  <Col sm={6}>
                    <span className={`fw-bold ${
                      medicament.stock_actuel <= medicament.stock_minimum 
                        ? 'text-warning' 
                        : 'text-dark'
                    }`}>
                      {medicament.stock_actuel} unités
                    </span>
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={6} className="d-flex align-items-center gap-1">
                    <BsExclamationTriangle size={14} className="text-muted" />
                    <strong>Stock Minimum:</strong>
                  </Col>
                  <Col sm={6}>{medicament.stock_minimum} unités</Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={6} className="d-flex align-items-center gap-1">
                    <BsCheckCircle size={14} className="text-muted" />
                    <strong>Statut Stock:</strong>
                  </Col>
                  <Col sm={6}>{getStockBadge()}</Col>
                </Row>
                
                <hr />
                
                <Row className="mb-2">
                  <Col sm={6} className="d-flex align-items-center gap-1">
                    <strong>Prix Unitaire:</strong>
                  </Col>
                  <Col sm={6}>
                    <span className="fw-bold text-dark">
                      {medicament.prix_unitaire ? `${medicament.prix_unitaire} Ar` : '-'}
                    </span>
                  </Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={6} className="d-flex align-items-center gap-1">
                    <strong>Valeur Stock:</strong>
                  </Col>
                  <Col sm={6}>
                    <span className="fw-bold text-dark">
                      {medicament.prix_unitaire && medicament.stock_actuel 
                        ? `${(medicament.prix_unitaire * medicament.stock_actuel).toFixed(2)} Ar`
                        : '-'
                      }
                    </span>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Deuxième ligne - Informations Médicales */}
        <Row className="mt-3">
          <Col md={6}>
            <Card className="h-100 border shadow-sm">
              <Card.Header className="bg-secondary text-white d-flex align-items-center gap-2">
                <BsClipboard />
                <h6 className="mb-0">Informations Médicales</h6>
              </Card.Header>
              <Card.Body>
                <Row className="mb-2">
                  <Col sm={4} className="d-flex align-items-center gap-1">
                    <BsFileText size={14} className="text-muted" />
                    <strong>Prescription:</strong>
                  </Col>
                  <Col sm={8}>{getPrescriptionBadge()}</Col>
                </Row>
                
                <Row className="mb-2">
                  <Col sm={4} className="d-flex align-items-center gap-1">
                    <BsThermometer size={14} className="text-muted" />
                    <strong>Conservation:</strong>
                  </Col>
                  <Col sm={8}>
                    <Badge bg="secondary">
                      {medicament.conditions_conservation || 'Non spécifié'}
                    </Badge>
                  </Col>
                </Row>
                
                {medicament.posologie_standard && (
                  <div className="mt-3">
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <BsClipboard size={14} className="text-muted" />
                      <strong>Posologie Standard:</strong>
                    </div>
                    <div className="mt-1 p-2 bg-light rounded border">
                      {medicament.posologie_standard}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Colonne Résumé & Alertes */}
          <Col md={6}>
            <Card className="h-100 border shadow-sm">
              <Card.Header className="bg-secondary text-white d-flex align-items-center gap-2">
                {medicament.stock_actuel <= medicament.stock_minimum ? (
                  <>
                    <BsExclamationTriangle />
                    <h6 className="mb-0">Alertes</h6>
                  </>
                ) : (
                  <>
                    <BsCheckCircle />
                    <h6 className="mb-0">Résumé</h6>
                  </>
                )}
              </Card.Header>
              <Card.Body>
                {medicament.stock_actuel <= 0 ? (
                  <div className="alert alert-danger mb-0 border-danger d-flex align-items-center gap-2">
                    <BsExclamationTriangle />
                    <div>
                      <strong>RUPTURE DE STOCK</strong><br />
                      Ce médicament n'est plus disponible.
                    </div>
                  </div>
                ) : medicament.stock_actuel <= medicament.stock_minimum ? (
                  <div className="alert alert-warning mb-0 border-warning d-flex align-items-center gap-2">
                    <BsExclamationTriangle />
                    <div>
                      <strong>STOCK CRITIQUE</strong><br />
                      Seulement {medicament.stock_actuel} unités restantes.<br />
                      Stock minimum: {medicament.stock_minimum} unités.
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-success mb-0 border-success d-flex align-items-center gap-2">
                    <BsCheckCircle />
                    <div>
                      <strong>STOCK OPTIMAL</strong><br />
                      {medicament.stock_actuel - medicament.stock_minimum} unités au-dessus du minimum.
                    </div>
                  </div>
                )}
                
                {medicament.prescription_restreinte && (
                  <div className="mt-2 alert alert-secondary border d-flex align-items-center gap-2">
                    <BsInfoCircle />
                    <small>
                      <strong>Information:</strong> Ce médicament nécessite une ordonnance médicale.
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      
      <Modal.Footer className="bg-light">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <small className="text-muted d-flex align-items-center gap-1">
            <BsCalendar size={12} />
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </small>
          <Button variant="secondary" onClick={onHide}>
            Fermer
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default MedicamentDetails;