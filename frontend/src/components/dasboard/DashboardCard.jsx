import React from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { BsArrowUp, BsPerson, BsCalendarEvent, BsFileText, BsPeople } from 'react-icons/bs';

const DashboardCard = ({ 
  title, 
  value, 
  detail, 
  icon, 
  iconBgColor, 
  valueColor,
  loading = false 
}) => {
  const IconComponent = icon;

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Body>
        <Row className="align-items-center">
          <Col xs={8}>
            <p className="text-muted text-uppercase small mb-1">{title}</p>
            
            {loading ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span className="text-muted">Chargement...</span>
              </div>
            ) : (
              <>
                <h4 style={{ color: valueColor || '#333' }}>{value}</h4>
                <p className="small mb-0" style={{ color: detail?.includes('+') ? 'green' : 'grey' }}>
                  {detail}
                </p>
              </>
            )}
          </Col>
          <Col xs={4} className="text-end">
            <div 
              className="d-inline-flex justify-content-center align-items-center rounded-circle"
              style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: iconBgColor || '#f0f0f0' 
              }}
            >
              <IconComponent size={24} style={{ color: '#203A8D' }} />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export { DashboardCard, BsPerson, BsCalendarEvent, BsFileText, BsPeople };
export default DashboardCard;