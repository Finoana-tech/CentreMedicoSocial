// src/pages/RendezVous.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Alert, 
  Spinner,
  Button
} from 'react-bootstrap';
import { 
  BsCalendar2Check,
  BsArrowRepeat,
  BsCalendarCheck
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import RendezVousTable from '../components/rendez_vous/RendezVousTable';
import RendezVousDetails from '../components/rendez_vous/RendezVousDetails';
import { rendezvousService } from '../services/rendezVousService';
import { useCrud } from '../hooks/useCrud';
import NotificationToast from '../components/common/UI/NotificationToast';
import ConfirmationModal from '../components/common/UI/ConfirmationModal';

const RendezVous = () => {
  const navigate = useNavigate();
  
  const {
    data: rendezVousList,
    loading,
    error,
    remove,
    setError,
    fetchAll
  } = useCrud(rendezvousService);

  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState('assistant');
  const [stats, setStats] = useState({
    total: 0,
    aujourdhui: 0,
    en_attente: 0,
    en_cours: 0
  });

  const [viewRdv, setViewRdv] = useState(null);
  
  const [toast, setToast] = useState({ 
    show: false, 
    message: '', 
    type: 'success' 
  });
  
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
    const role = localStorage.getItem('userRole') || 'assistant';
    setUserRole(role);
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      await fetchAll();
      await loadStats();
    } catch (err) {
      console.error('Erreur chargement initial:', err);
      showToast('Erreur lors du chargement des données', 'danger');
    }
  }, [fetchAll]);

  // Charger les statistiques depuis l'API
  const loadStats = useCallback(async () => {
    try {
      const statsData = await rendezvousService.getDashboardStats();
      setStats({
        total: statsData.total || 0,
        aujourdhui: statsData.aujourdhui || 0,
        en_attente: statsData.en_attente || 0,
        en_cours: statsData.en_cours || 0
      });
    } catch (err) {
      console.error('Erreur chargement stats API:', err);
      // Fallback aux stats calculées localement
      const today = new Date().toDateString();
      const statsFallback = {
        total: rendezVousList?.length || 0,
        aujourdhui: rendezVousList?.filter(rdv => 
          new Date(rdv.date_heure).toDateString() === today
        ).length || 0,
        en_attente: rendezVousList?.filter(rdv => 
          rdv.statut === 'planifie'
        ).length || 0,
        en_cours: rendezVousList?.filter(rdv => 
          rdv.statut === 'en_cours'
        ).length || 0
      };
      setStats(statsFallback);
    }
  }, [rendezVousList]);

  // Mettre à jour les stats quand la liste change
  useEffect(() => {
    if (rendezVousList && rendezVousList.length > 0) {
      loadStats();
    }
  }, [rendezVousList, loadStats]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const showConfirmation = useCallback((title, message, onConfirm, type = 'warning') => {
    setConfirmModal({
      show: true,
      type,
      title,
      message,
      onConfirm: async () => {
        try {
          await onConfirm();
          setConfirmModal(prev => ({ ...prev, show: false }));
        } catch (err) {
          console.error('Erreur dans la confirmation:', err);
          showToast('Erreur lors de l\'opération', 'danger');
        }
      },
    });
  }, [showToast]);

  const handleCreate = useCallback(() => {
    navigate('/rendez-vous/nouveau');
  }, [navigate]);

  const handleEdit = useCallback((rdv) => {
    navigate(`/rendez-vous/modifier/${rdv.id_rendez_vous}`);
  }, [navigate]);

  const handleView = useCallback((rdv) => setViewRdv(rdv), []);

  const handleDelete = useCallback((id) => {
    showConfirmation(
      'Supprimer le rendez-vous',
      'Êtes-vous sûr de vouloir supprimer définitivement ce rendez-vous ? Cette action est irréversible.',
      async () => {
        try {
          await remove(id);
          showToast('Rendez-vous supprimé avec succès !', 'success');
          await loadStats(); // Recharger les stats après suppression
        } catch (err) {
          console.error('Erreur suppression:', err);
          const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression du rendez-vous';
          showToast(errorMessage, 'danger');
        }
      },
      'danger'
    );
  }, [showConfirmation, remove, showToast, loadStats]);

  const handleAnnuler = useCallback((rdv) => {
    showConfirmation(
      'Annuler le rendez-vous',
      `Êtes-vous sûr de vouloir annuler le rendez-vous du patient ${rdv.patient_prenom} ${rdv.patient_nom} ?`,
      async () => {
        try {
          const raison = prompt('Veuillez saisir la raison de l\'annulation :', 'Annulation par l\'administrateur');
          
          if (!raison || raison.trim() === '') {
            showToast('La raison de l\'annulation est requise', 'warning');
            return;
          }

          await rendezvousService.annuler(rdv.id_rendez_vous, raison.trim());
          showToast('Rendez-vous annulé avec succès !', 'success');
          await fetchAll();
          await loadStats();
        } catch (err) {
          console.error('Erreur annulation:', err);
          const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'annulation du rendez-vous';
          showToast(errorMessage, 'danger');
        }
      },
      'warning'
    );
  }, [showConfirmation, showToast, fetchAll, loadStats]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await fetchAll();
      await loadStats();
      showToast('Liste actualisée avec succès', 'info');
    } catch (err) {
      console.error('Erreur actualisation:', err);
      showToast('Erreur lors de l\'actualisation', 'danger');
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll, loadStats, showToast, refreshing]);

  const handleRendezVousUpdate = useCallback(async () => {
    await fetchAll();
    await loadStats();
    showToast('Rendez-vous mis à jour avec succès', 'success');
  }, [fetchAll, loadStats, showToast]);

  const handleDetailsClose = useCallback(() => {
    setViewRdv(null);
  }, []);

  // Fonction pour changer le statut d'un rendez-vous
  const handleStatusChange = useCallback((rdv, nouveauStatut) => {
    showConfirmation(
      `Changer le statut en "${nouveauStatut}"`,
      `Êtes-vous sûr de vouloir changer le statut du rendez-vous de ${rdv.patient_prenom} ${rdv.patient_nom} en "${nouveauStatut}" ?`,
      async () => {
        try {
          await rendezvousService.update(rdv.id_rendez_vous, {
            ...rdv,
            statut: nouveauStatut
          });
          showToast(`Statut changé en "${nouveauStatut}" avec succès !`, 'success');
          await fetchAll();
          await loadStats();
        } catch (err) {
          console.error('Erreur changement statut:', err);
          const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du changement de statut';
          showToast(errorMessage, 'danger');
        }
      },
      'info'
    );
  }, [showConfirmation, showToast, fetchAll, loadStats]);

  return (
    <Container fluid className="p-4 bg-light min-vh-100">

      {/* En-tête avec titre et boutons */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h2 fw-bold text-dark mb-1"> 
                  <BsCalendarCheck className="me-3 fs-1" /> 
                 Gestion des rendez-vous</h1>
              </div>
            </div>
      
      {/* Spinner */}
      <div className="mb-4">
        {(loading || refreshing) && (
          <div className="d-flex align-items-center text-muted mb-3">
            <Spinner animation="border" size="sm" className="me-2" />
            {refreshing ? 'Actualisation des données...' : 'Chargement des rendez-vous...'}
          </div>
        )}
      </div>

      {/* Tableau des rendez-vous */}
      <RendezVousTable
        rendezVousList={rendezVousList || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAnnuler={handleAnnuler}
        onCreate={handleCreate}
        onStatusChange={handleStatusChange}
        loading={loading || refreshing}
        refreshData={handleRefresh}
        error={error}
        userRole={userRole}
      />

      {/* Gestion des erreurs */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mt-3">
          <Alert.Heading>Erreur</Alert.Heading>
          {error}
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={handleRefresh}>
              <BsArrowRepeat className={refreshing ? 'spinning' : ''} /> Réessayer
            </Button>
          </div>
        </Alert>
      )}

      {/* Message si pas de rendez-vous */}
      {!loading && !error && rendezVousList && rendezVousList.length === 0 && (
        <Alert variant="info" className="mt-3">
          <div className="d-flex align-items-center">
            <BsCalendar2Check size={24} className="me-3" />
            <div>
              <h5 className="mb-1">Aucun rendez-vous trouvé</h5>
              <p className="mb-0">Commencez par créer votre premier rendez-vous.</p>
            </div>
          </div>
          <div className="mt-3">
            <Button variant="primary" onClick={handleCreate}>
              Créer un rendez-vous
            </Button>
          </div>
        </Alert>
      )}

      {/* Détails du rendez-vous */}
      <RendezVousDetails
        show={!!viewRdv}
        onHide={handleDetailsClose}
        rendezVous={viewRdv}
        onRendezVousUpdate={handleRendezVousUpdate}
        onStatusChange={handleStatusChange}
        userRole={userRole}
      />

      {/* Composants UI */}
      <NotificationToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      <ConfirmationModal
        show={confirmModal.show}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => setConfirmModal(prev => ({ ...prev, show: false }))}
        onConfirm={confirmModal.onConfirm}
      />

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default React.memo(RendezVous);