import React, { useState, useEffect } from 'react'; 
import { Container, Alert, Card, Pagination } from 'react-bootstrap';
import { BsPeople, BsChevronDoubleRight, BsChevronDoubleLeft } from 'react-icons/bs';
import PatientTable from '../components/patient/PatientTable';
import PatientForm from '../components/patient/PatientForm';
import { patientService } from '../services/patientService';
import { useCrud } from '../hooks/useCrud';
import NotificationToast from '../components/common/UI/NotificationToast';
import PatientDetails from '../components/patient/PatientDetails';
import ConfirmationModal from '../components/common/UI/ConfirmationModal';
import { useAuth } from '../contexts/AuthContext'; 

const Patients = () => {
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const {
    data: patients = [], 
    loading: crudLoading,
    error,
    create,
    update,
    remove,
    setError,
    fetchAll
  } = useCrud(patientService);

  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewPatient, setViewPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);
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
      if (!hasFetched && isMounted && isAuthenticated) {
        try {
          await fetchAll();
          setHasFetched(true);
        } catch (err) {
          console.error('Erreur lors du chargement initial des patients:', err);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasFetched, fetchAll, isAuthenticated]);

  
  const safePatients = Array.isArray(patients) ? patients : [];
  
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = safePatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(safePatients.length / patientsPerPage) || 1;

 
  if (authLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Accès non autorisé</Alert.Heading>
          <p>Vous devez être connecté pour accéder à la gestion des patients.</p>
        </Alert>
      </Container>
    );
  }

  // Combine loading states
  const loading = authLoading || crudLoading;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCreate = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      type: 'danger',
      message: 'Êtes-vous sûr de vouloir supprimer ce patient ?',
      onConfirm: async () => {
        try {
          await remove(id);
          setToast({ show: true, message: 'Patient supprimé avec succès !', type: 'success' });
          // Revenir à la première page si on supprime le dernier patient de la page
          if (currentPatients.length === 1 && currentPage > 1) {
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

  const handleView = (patient) => {
    setViewPatient(patient);
  };

  const handleSubmit = async (patientData) => {
    setConfirmModal({
      show: true,
      type: 'info',
      message: editingPatient ? 'Confirmer la modification du patient ?' : 'Confirmer l\'ajout du patient ?',
      onConfirm: async () => {
        try {
          if (editingPatient) {
            await update(editingPatient.id_patient, patientData);
            setToast({ show: true, message: 'Patient modifié avec succès !', type: 'success' });
          } else {
            await create(patientData);
            setToast({ show: true, message: 'Patient ajouté avec succès !', type: 'success' });
            // Aller à la dernière page après création d'un nouveau patient
            setCurrentPage(totalPages);
          }
          setShowForm(false);
          setEditingPatient(null);
        } catch (err) {
          setToast({ 
            show: true, 
            message: `Erreur lors de ${editingPatient ? 'la modification' : 'la création'} du patient`, 
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
      {/* En-tête avec titre et boutons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1"> 
            <BsPeople className="me-3 fs-1" /> 
           Gestion des Patients
          </h1>
        </div>
      </div>

      {/* Carte principale avec recherche et liste */}
      <Card className="border-light shadow-sm">
        <Card.Body>
          <div className="space-y-4">
            
            {/* Tableau des patients */}
            <PatientTable
              patients={currentPatients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
              onView={handleView}
              loading={loading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Pagination */}
            {safePatients.length > patientsPerPage && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination className="mb-0">
                  <Pagination.Prev 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="d-flex align-items-center justify-content-center fs-5"
                    style={{ minWidth: '140px' }}
                  >
                    <BsChevronDoubleLeft className="me-1 fs-5" />
                    Précédent
                  </Pagination.Prev>
                  
                  <Pagination.Next 
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="d-flex align-items-center justify-content-center fs-5"
                    style={{ minWidth: '140px' }}
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

      {/* Alertes et erreurs */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mt-3">
          {error}
        </Alert>
      )}

      {/* Composants modaux */}
      <PatientForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setEditingPatient(null);
        }}
        patient={editingPatient}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {viewPatient && (
        <PatientDetails
          show={!!viewPatient}
          onHide={() => setViewPatient(null)}
          patient={viewPatient}
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

export default Patients;