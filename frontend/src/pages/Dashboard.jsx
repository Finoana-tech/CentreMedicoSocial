import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  BsGraphUp, 
  BsPerson,
  BsCalendarEvent,
  BsFileText,
  BsPeople,
  BsClock
} from 'react-icons/bs';

import { DashboardCard } from '../components/dasboard/DashboardCard';
import AppointmentList from '../components/dasboard/AppointementList';
import PrescriptionList from '../components/dasboard/PrescriptionList';
import { PageLoadingSpinner } from '../components/dasboard/LoadingSpinner';
import { dashboardService } from '../services/dashboardService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    appointments: [],
    prescriptions: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsResponse, appointmentsResponse, prescriptionsResponse] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getTodayAppointments(),
          dashboardService.getRecentPrescriptions()
        ]);

        setDashboardData({
          stats: statsResponse.data || statsResponse,
          appointments: appointmentsResponse.data || appointmentsResponse,
          prescriptions: prescriptionsResponse.data || prescriptionsResponse
        });

      } catch (err) {
        console.error(' Erreur chargement dashboard:', err);
        setError('Erreur lors du chargement des données du dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

 
  const statsCards = [
    { 
      title: "Total Patients", 
      value: dashboardData.stats?.totalPatients?.toLocaleString() || "0", 
      detail: `${dashboardData.stats?.patientsMois || 0}% ce mois`, 
      icon: BsPerson, 
      iconBgColor: '#e3f2fd', 
      valueColor: '#203A8D' 
    },
    { 
      title: "Rendez-vous Aujourd'hui", 
      value: dashboardData.stats?.rdvAujourdhui?.toString() || "0", 
      detail: `${dashboardData.stats?.rdvEnAttente || 0} planifie`, 
      icon: BsCalendarEvent, 
      iconBgColor: '#fff3e0', 
      valueColor: '#FFA726' 
    },
    { 
      title: "Ordonnances Ce Mois", 
      value: dashboardData.stats?.ordonnancesMois?.toString() || "0", 
      detail: `${dashboardData.stats?.ordoSemaine || 0}% cette semaine`, 
      icon: BsFileText, 
      iconBgColor: '#e8f5e9', 
      valueColor: '#4CAF50' 
    },
    { 
      title: "Médecins Actifs", 
      value: dashboardData.stats?.medecinsActifs?.toString() || "0", 
      detail: "Tous sont actifs", 
      icon: BsPeople, 
      iconBgColor: '#ffebee', 
      valueColor: '#D32F2F' 
    },
  ];
  const plannedAppointments = dashboardData.appointments.filter(
    appointment => appointment.statut === 'Planifié'
  );
  const limitedPrescriptions = dashboardData.prescriptions.slice(0, 5);

  if (loading) {
    return (
      <Container fluid className="p-4">
        <PageLoadingSpinner />
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Tableau de Bord Médical</h1>
              <p className="text-muted mb-0 d-flex align-items-center">
                <BsClock className="me-2" size={14} />
                Centre Médico-Social JIRAMA - {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Card className="border-danger">
              <Card.Body className="text-danger">
                <strong>Erreur:</strong> {error}
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="ms-3"
                  onClick={() => window.location.reload()}
                >
                  Réessayer
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        {statsCards.map((stat, index) => (
          <Col key={index} xl={3} lg={6} md={6} sm={12} className="mb-3">
            <DashboardCard 
              {...stat}
              loading={loading}
            />
          </Col>
        ))}
      </Row>
      <Row>
        <Col xl={6} lg={12} className="mb-4">
          <AppointmentList 
            appointments={plannedAppointments}
            loading={loading}
            title="Rendez-vous à venir"
          />
        </Col>
        <Col xl={6} lg={12} className="mb-4">
          <PrescriptionList 
            prescriptions={limitedPrescriptions}
            loading={loading}
            title="Ordonnances récentes"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;