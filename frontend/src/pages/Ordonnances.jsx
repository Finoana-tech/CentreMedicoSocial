import React, { useState, useEffect } from 'react';
import { Container, Alert, Card, Button, Pagination } from 'react-bootstrap';
import { BsClipboardData, BsChevronDoubleRight, BsChevronDoubleLeft } from 'react-icons/bs';
import OrdonnanceTable from '../components/ordonnance/OrdonnanceTable';
import OrdonnanceForm from '../components/ordonnance/OrdonnanceForm';
import OrdonnanceDetails from '../components/ordonnance/OrdonnanceDetails';
import { ordonnanceService } from '../services/ordonnanceService';
import { useCrud } from '../hooks/useCrud';
import NotificationToast from '../components/common/UI/NotificationToast';
import ConfirmationModal from '../components/common/UI/ConfirmationModal';

const Ordonnances = () => {
  const {
    data: ordonnances,
    loading,
    error,
    create,
    update,
    remove,
    setError,
    fetchAll
  } = useCrud(ordonnanceService);

  const [showForm, setShowForm] = useState(false);
  const [editingOrdonnance, setEditingOrdonnance] = useState(null);
  const [viewOrdonnance, setViewOrdonnance] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordonnancesPerPage] = useState(10);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: 'info',
    message: '',
    onConfirm: null,
  });
  const [detailedOrdonnance, setDetailedOrdonnance] = useState(null);
  const indexOfLast = currentPage * ordonnancesPerPage;
  const indexOfFirst = indexOfLast - ordonnancesPerPage;
  const currentOrdonnances = ordonnances.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(ordonnances.length / ordonnancesPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleCreate = () => {
    setEditingOrdonnance(null);
    setShowForm(true);
  };

  const handleEdit = async (ordonnance) => {
    try {
      const ordonnanceComplete = await ordonnanceService.getById(ordonnance.id_ordonnance);
      setEditingOrdonnance(ordonnanceComplete.data || ordonnanceComplete);
      setShowForm(true);
    } catch (err) {
      console.error('Erreur chargement ordonnance:', err);
      setEditingOrdonnance(ordonnance);
      setShowForm(true);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      type: 'danger',
      message: 'Êtes-vous sûr de vouloir supprimer cette ordonnance ?',
      onConfirm: async () => {
        try {
          await remove(id);
          setToast({ show: true, message: 'Ordonnance supprimée avec succès !', type: 'success' });
          if (currentOrdonnances.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        } catch (err) {
          setToast({ 
            show: true, 
            message: 'Erreur lors de la suppression : ' + (err.message || 'Erreur inconnue'), 
            type: 'danger' 
          });
        } finally {
          setConfirmModal({ ...confirmModal, show: false });
        }
      },
    });
  };

  const handleView = async (ordonnance) => {
    try {
      const details = await ordonnanceService.getDetailsById(ordonnance.id_ordonnance);
      setDetailedOrdonnance(details.data || details);
    } catch (err) {
      console.error('Erreur chargement détails:', err);
      setDetailedOrdonnance(ordonnance);
    }
  };

  const handleExportPDF = async (id) => {
    try {
      await ordonnanceService.exportToPDF(id);
      setToast({ 
        show: true, 
        message: 'PDF exporté avec succès !', 
        type: 'success' 
      });
    } catch (err) {
      console.error('Erreur export PDF:', err);
      setToast({ 
        show: true, 
        message: 'Erreur lors de l\'export PDF : ' + (err.message || 'Erreur inconnue'), 
        type: 'danger' 
      });
    }
  };

  const handleExportAllPDF = async () => {
    try {
      setConfirmModal({
        show: true,
        type: 'info',
        message: `Voulez-vous exporter les ${currentOrdonnances.length} ordonnances de cette page en PDF ? (Chaque ordonnance sera exportée dans un fichier séparé)`,
        onConfirm: async () => {
          try {
            let successCount = 0;
            let errorCount = 0;
            
            for (const ordonnance of currentOrdonnances) {
              try {
                await ordonnanceService.exportToPDF(ordonnance.id_ordonnance);
                successCount++;
              } catch (err) {
                console.error(`Erreur export PDF pour ordonnance ${ordonnance.id_ordonnance}:`, err);
                errorCount++;
              }
            }
            
            setToast({ 
              show: true, 
              message: `Export terminé : ${successCount} PDF(s) généré(s)${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`, 
              type: errorCount > 0 ? 'warning' : 'success' 
            });
          } catch (err) {
            setToast({ 
              show: true, 
              message: 'Erreur lors de l\'export multiple : ' + (err.message || 'Erreur inconnue'), 
              type: 'danger' 
            });
          } finally {
            setConfirmModal({ ...confirmModal, show: false });
          }
        },
      });
    } catch (err) {
      console.error('Erreur préparation export multiple:', err);
      setToast({ 
        show: true, 
        message: 'Erreur lors de la préparation de l\'export : ' + (err.message || 'Erreur inconnue'), 
        type: 'danger' 
      });
    }
  };

  const handleSubmit = async (ordonnanceData) => {
    setConfirmModal({
      show: true,
      type: 'info',
      message: editingOrdonnance 
        ? 'Confirmer la modification de cette ordonnance ?' 
        : 'Confirmer la création de cette nouvelle ordonnance ?',
      onConfirm: async () => {
        try {
          if (editingOrdonnance) {
            await update(editingOrdonnance.id_ordonnance, ordonnanceData);
            setToast({ 
              show: true, 
              message: 'Ordonnance modifiée avec succès !', 
              type: 'success' 
            });
          } else {
            await create(ordonnanceData);
            setToast({ 
              show: true, 
              message: 'Ordonnance créée avec succès !', 
              type: 'success' 
            });
            const newTotalPages = Math.ceil((ordonnances.length + 1) / ordonnancesPerPage);
            setCurrentPage(newTotalPages);
          }
          setShowForm(false);
          setEditingOrdonnance(null);
        } catch (err) {
          setToast({ 
            show: true, 
            message: `Erreur lors de ${editingOrdonnance ? 'la modification' : 'la création'} : ${err.message || 'Erreur inconnue'}`, 
            type: 'danger' 
          });
        } finally {
          setConfirmModal({ ...confirmModal, show: false });
        }
      },
    });
  };

  const handleRefresh = async () => {
    setCurrentPage(1);
    await fetchAll();
    setToast({ 
      show: true, 
      message: 'Liste des ordonnances actualisée !', 
      type: 'info' 
    });
  };

  useEffect(() => {
    if (!viewOrdonnance) {
      setDetailedOrdonnance(null);
    }
  }, [viewOrdonnance]);

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <BsClipboardData className="me-3 fs-1" />
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">Gestion des Ordonnances</h1>
          </div>
        </div>
      </div>

      <Card className="border-light shadow-sm">
        <Card.Body className="p-0">
          <div className="p-3">
            <OrdonnanceTable
              ordonnances={currentOrdonnances}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
              onView={handleView}
              onExportPDF={handleExportPDF}
              loading={loading}
            />
          </div>

          {/* Pagination améliorée */}
          {ordonnances.length > ordonnancesPerPage && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
              <small className="text-muted">
                Affichage de {indexOfFirst + 1} à {Math.min(indexOfLast, ordonnances.length)} sur {ordonnances.length} ordonnances
              </small>
              
              <Pagination className="mb-0">
                <Pagination.Prev 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="d-flex align-items-center gap-1"
                >
                  <BsChevronDoubleLeft />
                  Précédent
                </Pagination.Prev>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="d-flex align-items-center gap-1"
                >
                  Suivant
                  <BsChevronDoubleRight />
                </Pagination.Next>
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Messages d'erreur */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mt-3">
          <Alert.Heading>Erreur</Alert.Heading>
          {error}
        </Alert>
      )}

      {/* Modals */}
      <OrdonnanceForm
        show={showForm}
        onHide={() => { 
          setShowForm(false); 
          setEditingOrdonnance(null); 
        }}
        ordonnance={editingOrdonnance}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <OrdonnanceDetails
        show={!!detailedOrdonnance}
        onHide={() => {
          console.log('Fermeture modal détails');
          setViewOrdonnance(null);
          setDetailedOrdonnance(null);
        }}
        ordonnance={detailedOrdonnance}
        onExportPDF={handleExportPDF}
      />

      {/* Notifications */}
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

      <style>
        {`
          .spinning {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Container>
  );
};

export default Ordonnances;