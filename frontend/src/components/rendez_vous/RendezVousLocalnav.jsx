// src/components/rendez_vous/RendezVousLocalNavCompact.jsx
import React from 'react';
import { ButtonGroup, Button, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BsCalendar2Check,
  BsCalendarPlus,
  BsCalendarWeek,
  BsGraphUp,
  BsArrowRepeat,
  BsPersonBadge,
  BsPerson,
  BsGear,
  BsCapsule
} from 'react-icons/bs';

const RendezVousLocalNavCompact = ({ 
  stats = {},
  onRefresh,
  refreshing = false,
  userRole = 'assistant'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/rendez-vous/nouveau') || path.includes('/rendez-vous/modifier/')) return 'prise-rdv';
    if (path.includes('/rendez-vous/agenda')) return 'agenda';
    if (path.includes('/rendez-vous/statistiques')) return 'statistiques';
    return 'liste'; 
  };

  const activeTab = getActiveTab();

  const tabs = [
    { 
      id: 'liste', 
      label: 'Liste', 
      icon: BsCalendar2Check, 
      roles: ['medecin', 'assistant', 'admin', 'pharmacien'],
      tooltip: 'Voir tous les rendez-vous',
      badge: stats.total,
      path: '/rendez-vous'
    },
    { 
      id: 'prise-rdv', 
      label: 'Nouveau', 
      icon: BsCalendarPlus, 
      roles: ['assistant', 'admin'],
      tooltip: 'Créer un nouveau rendez-vous',
      variant: 'success',
      path: '/rendez-vous/nouveau'
    },
    { 
      id: 'agenda', 
      label: 'Agenda', 
      icon: BsCalendarWeek, 
      roles: ['medecin', 'assistant', 'admin'],
      tooltip: 'Agenda calendrier',
      badge: stats.aujourdhui,
      path: '/rendez-vous/agenda'
    },
    { 
      id: 'statistiques', 
      label: 'Statistiques', 
      icon: BsGraphUp, 
      roles: ['admin', 'assistant'],
      tooltip: 'Analyses et rapports',
      variant: 'info',
      path: '/rendez-vous/statistiques'
    }
  ].filter(tab => tab.roles.includes(userRole));

  const getRoleBadgeVariant = () => {
    switch(userRole) {
      case 'medecin': return 'primary';
      case 'assistant': return 'success';
      case 'admin': return 'warning';
      case 'pharmacien': return 'info';
      default: return 'secondary';
    }
  };

  const getRoleIcon = () => {
    switch(userRole) {
      case 'medecin': return <BsPersonBadge className="me-1" />;
      case 'assistant': return <BsPerson className="me-1" />;
      case 'admin': return <BsGear className="me-1" />;
      case 'pharmacien': return <BsCapsule className="me-1" />;
      default: return <BsPerson className="me-1" />;
    }
  };

  const handleTabClick = (tab) => {
    console.log('Clic sur onglet:', tab.id);
    console.log('Navigation vers:', tab.path);
    navigate(tab.path);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Rafraîchissement par défaut
      window.location.reload();
    }
  };

  return (
    <div className="bg-white border-bottom shadow-sm py-3 sticky-top" style={{ zIndex: 1020 }}>
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              
              {/* Section Titre et Rôle */}
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                    <BsCalendar2Check className="text-primary" size={20} />
                  </div>
                  <div>
                    <h2 className="h5 fw-bold text-dark mb-0">
                      Gestion des Rendez-vous
                    </h2>
                    <small className="text-muted">
                      {stats.total !== undefined ? `${stats.total} rendez-vous au total` : 'Chargement...'}
                    </small>
                  </div>
                </div>
                
                {/* Badge du rôle amélioré */}
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Role actuel: {userRole}</Tooltip>}
                >
                  <Badge 
                    bg={getRoleBadgeVariant()} 
                    className="d-flex align-items-center gap-1 px-2 py-2"
                  >
                    {getRoleIcon()}
                    <span className="text-uppercase fw-normal" style={{ fontSize: '0.7rem' }}>
                      {userRole}
                    </span>
                  </Badge>
                </OverlayTrigger>
              </div>

              {/* Navigation et Actions */}
              <div className="d-flex align-items-center gap-2">
                
                {/* Navigation Principale */}
                <ButtonGroup size="sm" className="shadow-sm rounded-3 overflow-hidden">
                  {tabs.map(tab => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.id;
                    const variant = tab.variant || 'primary';
                    const badgeCount = tab.badge || 0;
                    
                    return (
                      <OverlayTrigger
                        key={tab.id}
                        placement="bottom"
                        overlay={<Tooltip>{tab.tooltip}</Tooltip>}
                      >
                        <Button
                          variant={isActive ? variant : `outline-${variant}`}
                          className={`position-relative d-flex align-items-center gap-2 px-3 border-0 rounded-0 ${
                            isActive ? 'shadow-sm' : ''
                          }`}
                          onClick={() => handleTabClick(tab)}
                          style={{ 
                            minWidth: '100px',
                            transition: 'all 0.2s ease',
                            borderLeft: '1px solid rgba(0,0,0,0.1) !important'
                          }}
                        >
                          <IconComponent size={14} />
                          <span className="fw-medium">{tab.label}</span>
                          
                          {/* Badge de notification */}
                          {badgeCount > 0 && (
                            <Badge 
                              bg={isActive ? 'light' : 'dark'} 
                              text={isActive ? 'dark' : 'white'}
                              pill 
                              className="position-absolute top-0 start-100 translate-middle"
                              style={{ 
                                fontSize: '0.55rem',
                                minWidth: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {badgeCount > 99 ? '99+' : badgeCount}
                            </Badge>
                          )}
                        </Button>
                      </OverlayTrigger>
                    );
                  })}
                </ButtonGroup>

                {/* Bouton Actualiser avec Tooltip */}
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Actualiser les donnees</Tooltip>}
                >
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="d-flex align-items-center px-3 shadow-sm rounded-3"
                    style={{
                      transition: 'all 0.2s ease',
                      minWidth: '120px'
                    }}
                  >
                    <BsArrowRepeat 
                      className={refreshing ? 'spinning' : ''} 
                      size={14} 
                    />
                    <span className="ms-2 fw-medium">Actualiser</span>
                  </Button>
                </OverlayTrigger>
              </div>
            </div>
          </div>
        </div>

        {/* Indicateur de chargement */}
        {refreshing && (
          <div className="row mt-2">
            <div className="col">
              <div className="d-flex align-items-center text-primary">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <small className="fw-medium">Mise a jour des donnees...</small>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Effet de hover sur les boutons */
        .btn-group .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Style pour le premier bouton du groupe */
        .btn-group .btn:first-child {
          border-top-left-radius: 0.5rem !important;
          border-bottom-left-radius: 0.5rem !important;
        }
        
        /* Style pour le dernier bouton du groupe */
        .btn-group .btn:last-child {
          border-top-right-radius: 0.5rem !important;
          border-bottom-right-radius: 0.5rem !important;
        }
      `}</style>
    </div>
  );
};

export default RendezVousLocalNavCompact;