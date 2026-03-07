import React, { useState, useEffect, useMemo } from 'react';
import { Container, Alert, Card, Pagination } from 'react-bootstrap';
import { BsPersonFillGear } from 'react-icons/bs';
import UtilisateurTable from '../components/utilisateur/UtilisateurTable';
import UtilisateurForm from '../components/utilisateur/UtilisateurForm';
import { utilisateurService } from '../services/utilisateurService';
import { useCrud } from '../hooks/useCrud';
import NotificationToast from '../components/common/UI/NotificationToast';
import ConfirmationModal from '../components/common/UI/ConfirmationModal';

const Utilisateurs = () => {
  const {
    data: utilisateurs = [],
    loading,
    error,
    create,
    update,
    remove,
    setError,
    fetchAll
  } = useCrud(utilisateurService);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: 'info',
    message: '',
    onConfirm: null,
  });

  /* =========================
     Chargement initial
  ========================= */
  useEffect(() => {
    fetchAll();
  }, []);

  const safeUtilisateurs = Array.isArray(utilisateurs) ? utilisateurs : [];

  /* =========================
     Pagination
  ========================= */
  const totalPages = Math.max(1, Math.ceil(safeUtilisateurs.length / usersPerPage));
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = safeUtilisateurs.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => setCurrentPage(page);

  /* =========================
     Actions CRUD
  ========================= */
  const handleCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      show: true,
      type: 'danger',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      onConfirm: async () => {
        try {
          await remove(id);
          setToast({ show: true, message: 'Utilisateur supprimé avec succès', type: 'success' });

          if (currentUsers.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        } catch {
          setToast({ show: true, message: 'Erreur lors de la suppression', type: 'danger' });
        } finally {
          setConfirmModal({ ...confirmModal, show: false });
        }
      }
    });
  };

  const handleToggleActif = async (id, actif) => {
    try {
      await update(id, { actif });
      setToast({
        show: true,
        message: actif ? 'Utilisateur activé' : 'Utilisateur désactivé',
        type: 'success'
      });
    } catch {
      setToast({ show: true, message: 'Erreur lors du changement de statut', type: 'danger' });
    }
  };

  const handleSubmit = async (userData) => {
    try {
      if (editingUser) {
        await update(editingUser.id_utilisateur, userData);
        setToast({ show: true, message: 'Utilisateur modifié avec succès', type: 'success' });
      } else {
        await create(userData);
        setToast({ show: true, message: 'Utilisateur créé avec succès', type: 'success' });
        setCurrentPage(1);
      }
      setShowForm(false);
      setEditingUser(null);
      fetchAll(); // Recharger la liste
    } catch {
      setToast({
        show: true,
        message: `Erreur lors de ${editingUser ? 'la modification' : 'la création'}`,
        type: 'danger'
      });
    }
  };

  /* =========================
     Pagination UI
  ========================= */
  const renderPagination = () => (
    <Pagination>
      <Pagination.Prev
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      />
      {[...Array(totalPages)].map((_, i) => (
        <Pagination.Item
          key={i + 1}
          active={i + 1 === currentPage}
          onClick={() => handlePageChange(i + 1)}
        >
          {i + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    </Pagination>
  );

  /* =========================
     Render
  ========================= */
  return (
    <Container fluid className="p-4">
      <h1 className="h2 fw-bold mb-4">
        <BsPersonFillGear className="me-2" /> Gestion des utilisateurs
      </h1>

      <Card className="shadow-sm">
        <Card.Body>
          <UtilisateurTable
            utilisateurs={currentUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
            onToggle={handleToggleActif}
            loading={loading}
          />

          {safeUtilisateurs.length > usersPerPage && (
            <div className="d-flex justify-content-center mt-3">
              {renderPagination()}
            </div>
          )}
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mt-3">
          {error}
        </Alert>
      )}

      <UtilisateurForm
        show={showForm}
        onHide={() => { setShowForm(false); setEditingUser(null); }}
        user={editingUser}
        onSuccess={handleSubmit}  // ✅ BON NOM (correspond à la définition)
      />

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

export default Utilisateurs;
