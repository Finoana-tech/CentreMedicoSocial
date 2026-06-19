import React, { useState, useEffect, useCallback } from 'react';
import { Container, Alert, Card, Pagination } from 'react-bootstrap';
import { BsPersonVcard, BsChevronDoubleRight, BsChevronDoubleLeft } from 'react-icons/bs';
import MedecinTable from '../components/medecin/MedecinTable';
import MedecinForm from '../components/medecin/MedecinForm';
import { medecinService } from '../services/medecinService';
import { useCrud } from '../hooks/useCrud';
import NotificationToast from '../components/common/UI/NotificationToast';
import MedecinDetails from '../components/medecin/MedecinDetails';
import ConfirmationModal from '../components/common/UI/ConfirmationModal';

const Medecins = () => {
  const {
    data: medecins,
    loading,
    error,
    create,
    update,
    remove,
    setError,
    fetchAll
  } = useCrud(medecinService);

  const [showForm, setShowForm] = useState(false);
  const [editingMedecin, setEditingMedecin] = useState(null);
  const [viewMedecin, setViewMedecin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [medecinsPerPage] = useState(5);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: 'info',
    message: '',
    onConfirm: null,
  });

  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!hasFetched && isMounted) {
        try {
          await fetchAll();
          setHasFetched(true);
        } catch (err) {
          console.error('Erreur lors du chargement initial:', err);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasFetched, fetchAll]);

  const indexOfLastMedecin = currentPage * medecinsPerPage;
  const indexOfFirstMedecin = indexOfLastMedecin - medecinsPerPage;
  const currentMedecins = medecins.slice(indexOfFirstMedecin, indexOfLastMedecin);
  const totalPages = Math.ceil(medecins.length / medecinsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCreate = () => {
    setEditingMedecin(null);
    setShowForm(true);
  };

  const handleEdit = (medecin) => {
    setEditingMedecin(medecin);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      type: 'danger',
      message: 'Etes-vous sur de vouloir supprimer ce medecin ?',
      onConfirm: async () => {
        try {
          await remove(id);
          setToast({ show: true, message: 'Medecin supprime avec succes !', type: 'success' });
          if (currentMedecins.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        } catch (err) {
          setToast({ show: true, message: 'Erreur lors de la suppression', type: 'danger' });
        } finally {
          setConfirmModal({ ...confirmModal, show: false });
        }
      },
    });
  };

  const handleView = (medecin) => {
    setViewMedecin(medecin);
  };

  const handleSubmit = async (medecinData) => {
    setConfirmModal({
      show: true,
      type: 'info',
      message: editingMedecin ? 'Confirmer la modification du medecin ?' : 'Confirmer l ajout du medecin ?',
      onConfirm: async () => {
        try {
          if (editingMedecin) {
            
            const medecinId = editingMedecin.id_medecin || editingMedecin.id;
            await update(medecinId, medecinData);
            setToast({ show: true, message: 'Medecin modifie avec succes !', type: 'success' });
          } else {
            await create(medecinData);
            setToast({ show: true, message: 'Medecin ajoute avec succes !', type: 'success' });
            setCurrentPage(totalPages);
          }
          setShowForm(false);
          setEditingMedecin(null);
        } catch (err) {
          setToast({
            show: true,
            message: `Erreur lors de ${editingMedecin ? 'la modification' : 'la creation'} du medecin`,
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
    setCurrentPage(1);
    await fetchAll();
  };

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">
            <BsPersonVcard className="me-3 fs-1" />
            Gestion des Medecins
          </h1>
        </div>
      </div>

      <Card className="border-light shadow-sm">
        <Card.Body>
          <div className="space-y-4">
            <MedecinTable
              medecins={currentMedecins}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
              onView={handleView}
              onRefresh={handleRefresh}
              loading={loading}
            />

            {medecins.length > medecinsPerPage && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination className="mb-0">
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="d-flex align-items-center justify-content-center fs-5"
                    style={{ minWidth: '120px' }}
                  >
                    <BsChevronDoubleLeft className="me-1 fs-5" />
                    Precedent
                  </Pagination.Prev>

                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="d-flex align-items-center justify-content-center fs-5"
                    style={{ minWidth: '120px' }}
                  >
                    Suivant
                    <BsChevronDoubleRight className="ms-1 fs-5" />
                  </Pagination.Next>
                </Pagination>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mt-3">
          {error}
        </Alert>
      )}

      <MedecinForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setEditingMedecin(null);
        }}
        medecin={editingMedecin}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {viewMedecin && (
        <MedecinDetails
          show={!!viewMedecin}
          onHide={() => setViewMedecin(null)}
          medecin={viewMedecin}
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
    </Container>
  );
};

export default Medecins;