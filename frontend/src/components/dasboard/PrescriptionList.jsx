import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { BsFileText, BsPerson, BsCalendar } from 'react-icons/bs';
import { CardLoadingSpinner } from './LoadingSpinner';

const PrescriptionList = ({ prescriptions = [], loading = false, title = "Ordonnances récentes" }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      'Prescrite': { bg: 'secondary', text: 'Prescrite' },
      'Délivrée': { bg: 'success', text: 'Délivrée' },
      'Partiellement délivrée': { bg: 'warning', text: 'Partielle' }
    };

    const config = statusConfig[statut] || { bg: 'secondary', text: statut };
    return <Badge bg={config.bg} className="ms-1">{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-0 h-100">
        <Card.Body>
          <Card.Title className="d-flex align-items-center mb-3">
            <BsFileText className="me-2 text-primary" />
            {title}
          </Card.Title>
          <CardLoadingSpinner />
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body>
        <Card.Title className="d-flex align-items-center justify-content-between mb-3">
          <span className="d-flex align-items-center">
            <BsFileText className="me-2 text-primary" />
            {title}
          </span>
          <Badge bg="success" pill>{prescriptions.length}</Badge>
        </Card.Title>

        {prescriptions.length === 0 ? (
          <div className="text-center text-muted py-4">
            <BsFileText size={32} className="mb-2 opacity-50" />
            <p className="mb-0">Aucune ordonnance récente</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {prescriptions.map((prescription, index) => (
              <ListGroup.Item key={index} className="px-0 py-3 border-bottom">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <strong className="me-2">
                        {prescription.name}
                      </strong>
                      {getStatusBadge(prescription.statut)}
                    </div>
                    
                    <div className="d-flex align-items-center text-muted small mb-1">
                      <BsPerson size={14} className="me-1" />
                      <span>{prescription.doctor}</span>
                    </div>
                    
                    {prescription.medicaments > 0 && (
                      <div className="text-success small">
                        {prescription.medicaments} médicament(s)
                      </div>
                    )}
                    
                    {prescription.instructions && (
                      <div className="text-muted small mt-1">
                        {prescription.instructions.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                  
                  <div className="text-end ms-3">
                    <div className="d-flex align-items-center text-muted small">
                      <BsCalendar className="me-1" size={14} />
                      {formatDate(prescription.date)}
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default PrescriptionList;