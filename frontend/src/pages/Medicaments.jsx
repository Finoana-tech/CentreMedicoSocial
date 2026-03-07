import React, { useState, useEffect } from 'react';
import { Container, Alert, Row, Col, Card } from 'react-bootstrap';
import { BsCapsule, BsArrowClockwise, BsExclamationTriangle, BsGraphUp, BsPrescription } from 'react-icons/bs';
import MedicamentTable from '../components/medicament/Medicamenttable';
import MedicamentForm from '../components/medicament/MedicamentForm';
import { medicamentService } from '../services/medicamentService';
import { useCrud } from '../hooks/useCrud';
import NotificationToast from '../components/common/UI/NotificationToast';
import MedicamentDetails from '../components/medicament/MedicamentDetails';
import ConfirmationModal from '../components/common/UI/ConfirmationModal';

const Medicaments = () => {
  const {
    data: medicaments,
    loading,
    error,
    create,
    update,
    remove,
    setError,
    fetchAll
  } = useCrud(medicamentService);

  const [showForm, setShowForm] = useState(false);
  const [editingMedicament, setEditingMedicament] = useState(null);
  const [viewMedicament, setViewMedicament] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: 'info',
    message: '',
    onConfirm: null,
  });

  // États pour les statistiques et stock critique
  const [stats, setStats] = useState(null);
  const [stockCritique, setStockCritique] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Charger les statistiques et stock critique
  const loadAdditionalData = async () => {
    try {
      setLoadingStats(true);
      const [statsData, critiqueData] = await Promise.all([
        medicamentService.getStats(),
        medicamentService.getStockCritique()
      ]);
      setStats(statsData.data || statsData);
      setStockCritique(critiqueData.data || critiqueData);
    } catch (err) {
      console.error('Erreur chargement données supplémentaires:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Charger les données au montage et après chaque opération CRUD
  useEffect(() => {
    fetchAll();
    loadAdditionalData();
  }, []);

  const handleCreate = () => {
    setEditingMedicament(null);
    setShowForm(true);
  };

  const handleEdit = (medicament) => {
    setEditingMedicament(medicament);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      type: 'danger',
      message: 'Êtes-vous sûr de vouloir supprimer ce médicament ?',
      onConfirm: async () => {
        try {
          await remove(id);
          setToast({ show: true, message: 'Médicament supprimé avec succès !', type: 'success' });
          loadAdditionalData();
        } catch (err) {
          setToast({ show: true, message: 'Erreur lors de la suppression', type: 'danger' });
        } finally {
          setConfirmModal({ ...confirmModal, show: false });
        }
      },
    });
  };

  const handleView = (medicament) => {
    setViewMedicament(medicament);
  };

  const handleSubmit = async (medicamentData) => {
    setConfirmModal({
      show: true,
      type: 'info',
      message: editingMedicament ? 'Confirmer la modification du médicament ?' : 'Confirmer l\'ajout du médicament ?',
      onConfirm: async () => {
        try {
          if (editingMedicament) {
            await update(editingMedicament.id_medicament, medicamentData);
            setToast({ show: true, message: 'Médicament modifié avec succès !', type: 'success' });
          } else {
            await create(medicamentData);
            setToast({ show: true, message: 'Médicament ajouté avec succès !', type: 'success' });
          }
          setShowForm(false);
          setEditingMedicament(null);
          loadAdditionalData();
        } catch (err) {
          setToast({ 
            show: true, 
            message: `Erreur lors de ${editingMedicament ? 'la modification' : 'la création'} du médicament`, 
            type: 'danger' 
          });
        } finally {
          setConfirmModal({ ...confirmModal, show: false });
        }
      },
    });
  };

  const handleRefresh = async () => {
    setSearchQuery('');
    await fetchAll();
    await loadAdditionalData();
    setToast({ show: true, message: 'Liste actualisée avec succès !', type: 'success' });
  };

  return (
    <Container fluid className="p-4">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 text-dark">
            <BsCapsule className="me-3 fs-1" />
            Gestion des Médicaments
          </h2>
          <p className="text-muted mb-0">Gérez votre inventaire de médicaments et surveillez les stocks</p>
        </div>
      </div> 

      {/* Cartes de statistiques - Design épuré avec 3 couleurs */}
      {!loadingStats && stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="h-100 border shadow-sm">
              <Card.Body className="text-center p-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <BsCapsule size={20} className="text-primary" />
                </div>
                <h4 className="text-dark mb-1">{stats.total}</h4>
                <p className="text-muted mb-0 small">Total Médicaments</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className={`h-100 border shadow-sm ${
              stats.stock_critique > 0 ? 'border-warning' : ''
            }`}>
              <Card.Body className="text-center p-3">
                <div className={`rounded-circle d-inline-flex p-3 mb-3 ${
                  stats.stock_critique > 0 ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'
                }`}>
                  <BsExclamationTriangle 
                    size={20} 
                    className={stats.stock_critique > 0 ? 'text-warning' : 'text-primary'} 
                  />
                </div>
                <h4 className={stats.stock_critique > 0 ? 'text-warning' : 'text-dark'}>{stats.stock_critique}</h4>
                <p className="text-muted mb-0 small">Stock Critique</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100 border shadow-sm">
              <Card.Body className="text-center p-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <BsPrescription size={20} className="text-primary" />
                </div>
                <h4 className="text-dark mb-1">{stats.prescription_restreinte}</h4>
                <p className="text-muted mb-0 small">Sous Ordonnance</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100 border shadow-sm">
              <Card.Body className="text-center p-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                  <BsGraphUp size={20} className="text-primary" />
                </div>
                <h4 className="text-dark mb-1">
                  {stats.valeur_stock_total ? `${stats.valeur_stock_total.toFixed(0)} Ar` : 'Ar'}
                </h4>
                <p className="text-muted mb-0 small">Valeur Stock</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Alerte stock critique - Design sobre */}
      {stockCritique.length > 0 && (
        <Alert variant="warning" className="d-flex align-items-center border-warning">
          <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
            <BsExclamationTriangle className="text-warning" />
          </div>
          <div className="flex-grow-1">
            <strong className="text-dark">Attention:</strong> 
            <span className="text-dark ms-1">{stockCritique.length} médicament(s) en stock critique.</span>
          </div>
          <button 
            className="btn btn-outline-warning btn-sm"
            onClick={() => {
              // Filtrer la table pour montrer seulement les stocks critiques
              setSearchQuery('stock:critique');
            }}
          >
            Voir la liste
          </button>
        </Alert>
      )}

      {/* Message d'erreur */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="border-danger">
          <div className="d-flex align-items-center">
            <BsExclamationTriangle className="me-2" />
            {error}
          </div>
        </Alert>
      )}

      {/* Tableau des médicaments */}
      <div className='space-y-4'>
      <Card className="border-light shadow-sm">
        <Card.Body className="p-0">
          <MedicamentTable
            medicaments={medicaments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onView={handleView}
            onRefresh={handleRefresh}
            loading={loading}
          />
        </Card.Body>
      </Card>
      </div>

      {/* Modals */}
      <MedicamentForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setEditingMedicament(null);
        }}
        medicament={editingMedicament}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {viewMedicament && (
        <MedicamentDetails
          show={!!viewMedicament}
          onHide={() => setViewMedicament(null)}
          medicament={viewMedicament}
        />
      )}

      <NotificationToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <ConfirmationModal
        show={confirmModal.show}
        type={confirmModal.type}
        message={confirmModal.message}
        onClose={() => setConfirmModal({ ...confirmModal, show: false })}
        onConfirm={confirmModal.onConfirm}
      />

      {/* Style pour l'animation de rotation */}
      <style>
        {`
          .spinning {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* Amélioration de l'apparence des cartes */
          .card {
            transition: transform 0.2s ease-in-out;
          }
          
          .card:hover {
            transform: translateY(-2px);
          }
        `}
      </style>
    </Container>
  );
};

export default Medicaments;