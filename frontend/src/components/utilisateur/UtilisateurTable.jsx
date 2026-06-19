import React, { useState, useMemo } from 'react';
import { Table, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import {
  BsSearch,
  BsXCircle,
  BsPencil,
  BsTrash,
  BsCheckCircle,
  BsToggleOn,
  BsToggleOff,
  BsPersonFillGear
} from 'react-icons/bs';

const UtilisateurTable = ({
  utilisateurs,
  onEdit,
  onDelete,
  onCreate,
  onToggle,
  loading
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return utilisateurs;

    const query = searchQuery.toLowerCase();

    return utilisateurs.filter(user =>
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query) ||
      (user.id_medecin ? String(user.id_medecin).includes(query) : false)
    );
  }, [utilisateurs, searchQuery]);

  const formatActif = (actif) =>
    actif ? (
      <BsCheckCircle size={28} className="text-success" />
    ) : (
      <BsXCircle size={28} className="text-danger" />
    );

  const formatRole = (role) => {
    const map = {
      admin: { label: 'Administrateur', variant: 'danger' },
      medecin: { label: 'Médecin', variant: 'primary' },
      assistant: { label: 'Assistant', variant: 'secondary' },
      pharmacien: { label: 'Pharmacien', variant: 'success' }
    };

    const r = map[role] || { label: role, variant: 'dark' };
    return <Badge bg={r.variant}>{r.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <Form.Group className="d-flex align-items-center">
            <BsSearch size={18} className="me-2 text-muted" />
            <Form.Control
              type="text"
              placeholder="Rechercher par email, rôle ou ID médecin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <BsXCircle
                size={18}
                className="ms-2 text-danger"
                style={{ cursor: 'pointer' }}
                onClick={() => setSearchQuery('')}
              />
            )}
          </Form.Group>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={onCreate}>
            <BsPersonFillGear className="me-1" /> Nouvel utilisateur
          </Button>
        </Col>
      </Row>

      {/* Tableau */}
      <Table striped bordered hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>ID Médecin</th>
            <th className="text-center">Actif</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length ? (
            filteredUsers.map((user, index) => (
              <tr key={user.id_utilisateur}>
                {/* Index visuel */}
                <td>{index + 1}</td>

                <td>{user.email}</td>

                <td>{formatRole(user.role)}</td>

                <td>
                  {user.role === 'medecin' && user.id_medecin
                    ? user.id_medecin
                    : '—'}
                </td>

                <td className="text-center">
                  {formatActif(user.actif)}
                </td>

                <td className="text-center d-flex justify-content-center gap-2">
                  {/* Modifier */}
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => onEdit(user)}
                  >
                    <BsPencil /> Modifier
                  </Button>

                  {/* Toggle Actif / Inactif */}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => onToggle(user.id_utilisateur, !user.actif)}
                    className="d-flex align-items-center gap-1"
                  >
                    {user.actif ? (
                      <>
                        <BsToggleOn size={28} className="text-success" />
                        <span className="text-success">Actif</span>
                      </>
                    ) : (
                      <>
                        <BsToggleOff size={28} className="text-secondary" />
                        <span className="text-secondary">Inactif</span>
                      </>
                    )}
                  </Button>


                  {/* Supprimer */}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onDelete(user.id_utilisateur)}
                  >
                    <BsTrash /> Supprimer
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted py-4">
                {utilisateurs.length === 0
                  ? 'Aucun utilisateur enregistré'
                  : 'Aucun utilisateur trouvé'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <small className="text-muted">
        {filteredUsers.length} utilisateur(s) sur {utilisateurs.length}
      </small>
    </div>
  );
};

export default UtilisateurTable;
