// src/components/dashboard/AppointmentList.jsx
import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { BsCalendarEvent, BsPerson, BsClock } from 'react-icons/bs';
import { CardLoadingSpinner } from './LoadingSpinner';

const AppointmentList = ({ appointments = [], loading = false, title = "Rendez-vous à venir" }) => {
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      'Planifié': { bg: 'warning', text: 'Planifié' },
      'Confirmé': { bg: 'success', text: 'Confirmé' },
      'Terminé': { bg: 'secondary', text: 'Terminé' },
      'Annulé': { bg: 'danger', text: 'Annulé' },
      'Urgent': { bg: 'danger', text: 'Urgent' }
    };

    const config = statusConfig[statut] || { bg: 'secondary', text: statut };
    return <Badge bg={config.bg} className="ms-1">{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Card className="shadow-sm border-0 h-100">
        <Card.Body>
          <Card.Title className="d-flex align-items-center mb-3">
            <BsCalendarEvent className="me-2 text-primary" />
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
            <BsCalendarEvent className="me-2 text-primary" />
            {title}
          </span>
          <Badge bg="primary" pill>{appointments.length}</Badge>
        </Card.Title>

        {appointments.length === 0 ? (
          <div className="text-center text-muted py-4">
            <BsCalendarEvent size={32} className="mb-2 opacity-50" />
            <p className="mb-0">Aucun rendez-vous aujourd'hui</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {appointments.map((appointment, index) => (
              <ListGroup.Item key={index} className="px-0 py-3 border-bottom">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <strong className="me-2">
                        {appointment.name}
                      </strong>
                      {getStatusBadge(appointment.statut)}
                    </div>
                    
                    <div className="d-flex align-items-center text-muted small mb-1">
                      <BsPerson size={14} className="me-1" />
                      <span>{appointment.doctor}</span>
                    </div>
                    
                    {appointment.type && (
                      <div className="text-info small">
                        {appointment.type}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-end ms-3">
                    <div className="d-flex align-items-center text-primary fw-semibold">
                      <BsClock className="me-1" size={14} />
                      {formatTime(appointment.time)}
                    </div>
                    {appointment.specialite && (
                      <Badge bg="outline-secondary" text="dark" className="mt-1 small">
                        {appointment.specialite}
                      </Badge>
                    )}
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

export default AppointmentList;