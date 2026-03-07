import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { BsPeople, BsGenderMale, BsGenderFemale, BsTelephone } from 'react-icons/bs';

const PatientStats = ({ patients }) => {
  const stats = {
    total: patients.length,
    hommes: patients.filter(p => p.sexe === 'M').length,
    femmes: patients.filter(p => p.sexe === 'F').length,
    avecTelephone: patients.filter(p => p.telephone && p.telephone.trim() !== '').length,
  };

  const pourcentageHommes = stats.total > 0 ? ((stats.hommes / stats.total) * 100).toFixed(1) : 0;
  const pourcentageFemmes = stats.total > 0 ? ((stats.femmes / stats.total) * 100).toFixed(1) : 0;

  return (
    <Row className="mb-4">
      <Col xl={3} md={6} className="mb-3">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h4 className="text-primary mb-0">{stats.total}</h4>
                <small className="text-muted">Total Patients</small>
              </div>
              <div className="bg-primary rounded-circle p-3">
                <BsPeople className="text-white fs-4" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xl={3} md={6} className="mb-3">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h4 className="text-info mb-0">{stats.hommes}</h4>
                <small className="text-muted">
                  Hommes ({pourcentageHommes}%)
                </small>
              </div>
              <div className="bg-info rounded-circle p-3">
                <BsGenderMale className="text-white fs-4" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xl={3} md={6} className="mb-3">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h4 className="text-success mb-0">{stats.femmes}</h4>
                <small className="text-muted">
                  Femmes ({pourcentageFemmes}%)
                </small>
              </div>
              <div className="bg-success rounded-circle p-3">
                <BsGenderFemale className="text-white fs-4" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xl={3} md={6} className="mb-3">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body className="text-center">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h4 className="text-warning mb-0">{stats.avecTelephone}</h4>
                <small className="text-muted">Avec Téléphone</small>
              </div>
              <div className="bg-warning rounded-circle p-3">
                <BsTelephone className="text-white fs-4" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default PatientStats;