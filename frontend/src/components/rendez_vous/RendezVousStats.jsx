import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container,
  Card, 
  Row, 
  Col,
  Spinner,
  Breadcrumb,
  Button,
  Badge,
  Alert
} from 'react-bootstrap';
import { 
  useNavigate 
} from 'react-router-dom';
import { 
  BsCalendar2Check, 
  BsCalendarEvent,
  BsCheckCircle,
  BsClock,
  BsArrowLeft,
  BsGraphUp,
  BsPerson,
  BsXCircle,
  BsCalendarWeek
} from 'react-icons/bs';
import rendezvousService from '../../services/rendezVousService';
import RendezVousLocalNavCompact from './RendezVousLocalNav';

const RendezVousStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('assistant');

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'assistant';
    setUserRole(role);
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setError('');
    try {
      const statsData = await rendezvousService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
      setError('Impossible de charger les statistiques. Veuillez réessayer.');
      setStats({
        aujourdhui: 0,
        en_attente: 0,
        en_cours: 0,
        total: 0
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = () => {
    loadStats();
  };

  const handleCancel = () => {
    navigate('/rendez-vous');
  };

  if (statsLoading) {
    return (
      <div className="bg-light min-vh-100">
        <RendezVousLocalNavCompact 
          stats={{}}
          onRefresh={handleRefresh}
          refreshing={statsLoading}
          userRole={userRole}
        />
        <Container fluid className="p-4">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <div className="mt-3">Chargement des statistiques...</div>
          </div>
        </Container>
      </div>
    );
  }

  const statCards = [
    {
      title: "Aujourd'hui",
      value: stats.aujourdhui || 0,
      icon: BsCalendarEvent,
      description: 'Rendez-vous pour aujourd\'hui',
      trend: '+2 vs hier',
      color: 'primary'
    },
    {
      title: 'En Attente',
      value: stats.en_attente || 0,
      icon: BsClock,
      description: 'RDV planifiés',
      trend: 'À venir',
      color: 'warning'
    },
    {
      title: 'En Cours',
      value: stats.en_cours || 0,
      icon: BsCheckCircle,
      description: 'Consultations en cours',
      trend: 'Actuellement',
      color: 'info'
    },
    {
      title: 'Total Mensuel',
      value: stats.total || 0,
      icon: BsGraphUp,
      description: 'Total des RDV ce mois',
      trend: '+12% vs mois dernier',
      color: 'dark'
    }
  ];

  return (
    <div className="bg-light min-vh-100">
      
      <RendezVousLocalNavCompact 
        stats={stats}
        onRefresh={handleRefresh}
        refreshing={statsLoading}
        userRole={userRole}
      />

      <Container fluid className="p-4">
        {/* Fil d'Ariane */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item onClick={() => navigate('/rendez-vous')} style={{ cursor: 'pointer' }}>
            Rendez-vous
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Statistiques</Breadcrumb.Item>
        </Breadcrumb>

        {/* En-tête épuré */}
        <Card className="border-0 bg-white shadow-sm mb-4">
          <Card.Body className="py-4">
            <div className="text-center">
              <h2 className="text-muted mb-2">
                Tableau de Bord des Rendez-vous
              </h2>
            </div>
          </Card.Body>
        </Card>

        {error && (
          <Alert variant="warning" className="mb-4">
            <strong>Attention:</strong> {error}
          </Alert>
        )}

        <Row className="g-3 mb-5">
          {statCards.map((stat, index) => (
            <Col key={index} lg={3} md={6}>
              <Card className="border-0 shadow-sm h-100 hover-lift">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center">
                    <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded-circle me-3`}>
                      <stat.icon size={24} className={`text-${stat.color}`} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="h3 fw-bold text-dark mb-1">{stat.value}</div>
                      <div className="text-muted small mb-2">{stat.title}</div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">{stat.description}</span>
                        <Badge bg="outline-secondary" className="text-muted small">
                          {stat.trend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Section informations supplémentaires */}
        <Row className="g-3">
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0 text-primary">
                  <BsCalendarWeek className="me-2" />
                  Répartition des Statuts
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Planifiés</span>
                  <Badge bg="warning">{stats.en_attente || 0}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">En Cours</span>
                  <Badge bg="info">{stats.en_cours || 0}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Aujourd'hui</span>
                  <Badge bg="primary">{stats.aujourdhui || 0}</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0">
                <h5 className="mb-0 text-success">
                  <BsPerson className="me-2" />
                  Performance du Mois
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Taux de remplissage</span>
                  <Badge bg="success">
                    {stats.total > 0 ? Math.round((stats.aujourdhui / stats.total) * 100) : 0}%
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">RDV programmés</span>
                  <Badge bg="outline-primary">{stats.en_attente || 0}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Consultations actives</span>
                  <Badge bg="outline-info">{stats.en_cours || 0}</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Résumé global */}
        <Card className="border-0 bg-primary bg-opacity-10 mt-4">
          <Card.Body className="text-center py-4">
            <h5 className="text-primary mb-2">Résumé du Mois</h5>
            <div className="row justify-content-center">
              <div className="col-auto">
                <div className="h4 text-primary mb-0">{stats.total || 0}</div>
                <small className="text-muted">Total RDV</small>
              </div>
              <div className="col-auto">
                <div className="h4 text-warning mb-0">{stats.en_attente || 0}</div>
                <small className="text-muted">Planifiés</small>
              </div>
              <div className="col-auto">
                <div className="h4 text-info mb-0">{stats.en_cours || 0}</div>
                <small className="text-muted">En Cours</small>
              </div>
              <div className="col-auto">
                <div className="h4 text-success mb-0">{stats.aujourdhui || 0}</div>
                <small className="text-muted">Aujourd'hui</small>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Bouton retour */}
        <div className="text-center mt-4">
          <Button 
            variant="outline-primary" 
            onClick={handleCancel}
            className="px-4"
          >
            <BsArrowLeft className="me-2" />
            Retour à la liste des rendez-vous
          </Button>
        </div>
      </Container>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default React.memo(RendezVousStats);