// src/components/ordonnances/OrdonnanceDetails.jsx
import React from 'react';
import { Modal, Button, Row, Col, ListGroup, Badge, Card } from 'react-bootstrap';

const OrdonnanceDetails = ({ show, onHide, ordonnance, onExportPDF }) => {
  if (!ordonnance) return null;

  console.log('Données ordonnance reçues:', ordonnance); // DEBUG

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  // Fonction pour déterminer le badge de statut
  const getStatutBadge = (statut) => {
    switch(statut) {
      case 'Validée':
        return <Badge bg="success">{statut}</Badge>;
      case 'Brouillon':
        return <Badge bg="secondary">{statut}</Badge>;
      case 'En préparation':
        return <Badge bg="warning" text="dark">{statut}</Badge>;
      case 'Délivrée':
        return <Badge bg="primary">{statut}</Badge>;
      case 'Annulée':
        return <Badge bg="danger">{statut}</Badge>;
      default:
        return <Badge bg="secondary">{statut || 'Non défini'}</Badge>;
    }
  };

  // Fonction pour le badge de statut ligne
  const getLigneStatutBadge = (statut) => {
    switch(statut) {
      case 'delivre':
        return <Badge bg="success">Délivré</Badge>;
      case 'en_preparation':
        return <Badge bg="warning" text="dark">En préparation</Badge>;
      case 'prescrit':
        return <Badge bg="info">Prescrit</Badge>;
      case 'partiel':
        return <Badge bg="warning">Partiel</Badge>;
      case 'annule':
        return <Badge bg="danger">Annulé</Badge>;
      default:
        return <Badge bg="secondary">{statut}</Badge>;
    }
  };

  // CORRECTION : S'assurer que medicaments est toujours un tableau
  const medicaments = Array.isArray(ordonnance.medicaments) ? ordonnance.medicaments : [];
  const patient = ordonnance.patient || {};
  const medecin = ordonnance.medecin || {};

  // CORRECTION : Support des anciennes structures de données
  const patientNom = patient.nom || ordonnance.patient_nom || '';
  const patientPrenom = patient.prenom || ordonnance.patient_prenom || '';
  const medecinNom = medecin.nom || ordonnance.medecin_nom || '';
  const medecinPrenom = medecin.prenom || ordonnance.medecin_prenom || '';

  // CORRECTION : Fonction pour fermer le modal
  const handleClose = () => {
    console.log('Fermeture du modal demandée'); // DEBUG
    if (onHide) {
      onHide();
    }
  };

  // Fonction pour gérer l'export PDF
  const handleExportPDF = () => {
    if (onExportPDF && ordonnance.id_ordonnance) {
      onExportPDF(ordonnance.id_ordonnance);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          Ordonnance #{ordonnance.id_ordonnance}
          {ordonnance.urgence && <Badge bg="danger" className="ms-2">Urgent</Badge>}
          <div className="mt-2">{getStatutBadge(ordonnance.statut)}</div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Row>
          {/* Colonne Informations Générales */}
          <Col md={6}>
            <Card className="h-100 border shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">Informations Générales</h6>
              </Card.Header>
              <Card.Body>
                <Row className="mb-2">
                  <Col sm={5}><strong>Patient :</strong></Col>
                  <Col sm={7}>
                    {patientNom || patientPrenom ? `${patientNom} ${patientPrenom}` : '-'}
                    {patient.date_naissance && (
                      <div>
                        <small className="text-muted">
                          Né(e) le: {formatDate(patient.date_naissance)}
                        </small>
                      </div>
                    )}
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col sm={5}><strong>Médecin :</strong></Col>
                  <Col sm={7}>
                    {medecinNom ? `Dr. ${medecinNom} ${medecinPrenom}` : '-'}
                    {medecin.specialite && (
                      <div>
                        <small className="text-muted">
                          {medecin.specialite}
                        </small>
                      </div>
                    )}
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col sm={5}><strong>Date Prescription :</strong></Col>
                  <Col sm={7}>{formatDate(ordonnance.date_prescription)}</Col>
                </Row>

                <Row className="mb-2">
                  <Col sm={5}><strong>Statut :</strong></Col>
                  <Col sm={7}>{getStatutBadge(ordonnance.statut)}</Col>
                </Row>

                {ordonnance.date_validation && (
                  <Row className="mb-2">
                    <Col sm={5}><strong>Validée le :</strong></Col>
                    <Col sm={7}>{formatDateTime(ordonnance.date_validation)}</Col>
                  </Row>
                )}

                {ordonnance.date_delivrance && (
                  <Row className="mb-2">
                    <Col sm={5}><strong>Délivrée le :</strong></Col>
                    <Col sm={7}>{formatDateTime(ordonnance.date_delivrance)}</Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Colonne Informations Médicales */}
          <Col md={6}>
            <Card className="h-100 border shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">Informations Médicales</h6>
              </Card.Header>
              <Card.Body>
                <Row className="mb-2">
                  <Col sm={5}><strong>Diagnostic :</strong></Col>
                  <Col sm={7}>
                    {ordonnance.diagnostic ? (
                      <div className="border rounded p-2 bg-light">
                        {ordonnance.diagnostic}
                      </div>
                    ) : '-'}
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col sm={5}><strong>Instructions :</strong></Col>
                  <Col sm={7}>
                    {ordonnance.instructions ? (
                      <div className="border rounded p-2 bg-light">
                        {ordonnance.instructions}
                      </div>
                    ) : '-'}
                  </Col>
                </Row>

                {ordonnance.notes && (
                  <Row className="mb-2">
                    <Col sm={5}><strong>Notes :</strong></Col>
                    <Col sm={7}>
                      <div className="border rounded p-2 bg-light">
                        {ordonnance.notes}
                      </div>
                    </Col>
                  </Row>
                )}

                <hr />

                <Row className="mb-2">
                  <Col sm={5}><strong>Renouvelable :</strong></Col>
                  <Col sm={7}>
                    {ordonnance.renouvelable ? (
                      <Badge bg="success">Oui</Badge>
                    ) : (
                      <Badge bg="secondary">Non</Badge>
                    )}
                  </Col>
                </Row>

                {ordonnance.renouvelable && (
                  <>
                    <Row className="mb-2">
                      <Col sm={5}><strong>Renouvellements :</strong></Col>
                      <Col sm={7}>
                        <Badge bg="info">
                          {ordonnance.nb_renouvellements_effectues || 0} / {ordonnance.nb_renouvellements_autorises || 0}
                        </Badge>
                        {ordonnance.nb_renouvellements_effectues < ordonnance.nb_renouvellements_autorises && (
                          <div>
                            <small className="text-success">
                              {ordonnance.nb_renouvellements_autorises - ordonnance.nb_renouvellements_effectues} renouvellement(s) restant(s)
                            </small>
                          </div>
                        )}
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col sm={5}><strong>Validité :</strong></Col>
                      <Col sm={7}>
                        <Badge bg="outline-primary" className="border">
                          {ordonnance.duree_validite || 30} jours
                        </Badge>
                      </Col>
                    </Row>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section Médicaments - CORRIGÉE */}
        <Row className="mt-3">
          <Col>
            <Card className="border shadow-sm">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Médicaments Prescrits</h6>
                <Badge bg="light" text="dark">
                  {medicaments.length} médicament(s)
                </Badge>
              </Card.Header>
              <Card.Body>
                {medicaments.length > 0 ? (
                  <ListGroup variant="flush">
                    {medicaments.map((medicament, idx) => (
                      <ListGroup.Item key={medicament.id_ligne || idx} className="px-0 py-3">
                        <Row className="align-items-center">
                          <Col md={3}>
                            <div className="d-flex align-items-start">
                              <Badge bg="outline-secondary" className="me-2 mt-1 border">
                                #{idx + 1}
                              </Badge>
                              <div>
                                <strong className="text-primary">{medicament.nom_commercial || 'Médicament sans nom'}</strong>
                                {medicament.principe_actif && (
                                  <div>
                                    <small className="text-muted">{medicament.principe_actif}</small>
                                  </div>
                                )}
                                {medicament.dosage && (
                                  <div>
                                    <small className="text-muted">Dosage: {medicament.dosage}</small>
                                  </div>
                                )}
                                {/* DEBUG: Afficher toutes les données du médicament */}
                                <div style={{ display: 'none' }}>
                                  <small>DEBUG: {JSON.stringify(medicament)}</small>
                                </div>
                              </div>
                            </div>
                          </Col>

                          <Col md={2}>
                            <div>
                              <strong className="text-muted">Quantité :</strong>
                              <div className="mt-1">
                                <Badge bg="info" className="me-1">
                                  {medicament.quantite_prescrite || 0} prescrite(s)
                                </Badge>
                                {medicament.quantite_delivree > 0 && (
                                  <Badge bg="success" className="mt-1">
                                    {medicament.quantite_delivree} délivrée(s)
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Col>

                          <Col md={3}>
                            <div>
                              <strong className="text-muted">Posologie :</strong>
                              <div className="mt-1 border rounded p-2 bg-light">
                                {medicament.posologie || 'Non spécifiée'}
                              </div>
                            </div>
                          </Col>

                          <Col md={2}>
                            <div>
                              <strong className="text-muted">Durée :</strong>
                              <div className="mt-1">
                                <Badge bg="outline-secondary" className="border">
                                  {medicament.duree_traitement || '?'} jours
                                </Badge>
                              </div>
                            </div>
                          </Col>

                          <Col md={2}>
                            <div>
                              <strong className="text-muted">Statut :</strong>
                              <div className="mt-1">
                                {getLigneStatutBadge(medicament.statut)}
                              </div>
                            </div>
                          </Col>
                        </Row>

                        {/* Informations supplémentaires */}
                        <Row className="mt-3 pt-2 border-top">
                          <Col md={3}>
                            <small className="text-muted">
                              <strong>Voie :</strong> {medicament.voie_administration || 'Orale'}
                            </small>
                          </Col>
                          <Col md={3}>
                            <small className="text-muted">
                              <strong>Prix unitaire :</strong> {medicament.prix_unitaire ? `${medicament.prix_unitaire} Ar` : 'Non spécifié'}
                            </small>
                          </Col>
                          {medicament.date_delivrance && (
                            <Col md={3}>
                              <small className="text-muted">
                                <strong>Délivré le :</strong> {formatDate(medicament.date_delivrance)}
                              </small>
                            </Col>
                          )}
                          {medicament.notes && (
                            <Col md={3}>
                              <small className="text-muted">
                                <strong>Notes :</strong> {medicament.notes}
                              </small>
                            </Col>
                          )}
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center text-muted py-5">
                    <div className="py-3">
                      <i className="fs-1 text-muted"></i>
                      <p className="mt-2 mb-0">Aucun médicament prescrit</p>
                      <small>Cette ordonnance ne contient pas de médicaments</small>
                      {/* DEBUG: Afficher pourquoi */}
                      <div style={{ display: 'none' }}>
                        <small>DEBUG: medicaments = {JSON.stringify(ordonnance.medicaments)}</small>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      
      <Modal.Footer className="bg-light">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <div>
            <small className="text-muted">
              <strong>Créée le :</strong> {ordonnance.created_at ? formatDateTime(ordonnance.created_at) : '-'}
            </small>
            {ordonnance.updated_at && ordonnance.updated_at !== ordonnance.created_at && (
              <small className="text-muted ms-3">
                <strong>Modifiée le :</strong> {formatDateTime(ordonnance.updated_at)}
              </small>
            )}
          </div>
          <div>
            <Button 
              variant="success" 
              className="me-2"
              onClick={handleExportPDF}
            >
              <i className="bi bi-file-pdf me-1"></i>
              Exporter PDF
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default OrdonnanceDetails;