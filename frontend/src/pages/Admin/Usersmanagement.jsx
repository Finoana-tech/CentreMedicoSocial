// pages/Admin/UsersManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Alert,
  Badge,
  Spinner
} from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const UsersManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'assistant',
    telephone: '',
    specialite: '',
    numero_ordre: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      setError('Erreur de connexion');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id_utilisateur}`
        : '/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès');
        setShowModal(false);
        setEditingUser(null);
        resetForm();
        fetchUsers();
      } else {
        setError(data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      setError('Erreur de connexion');
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      role: user.role || 'assistant',
      telephone: user.telephone || '',
      specialite: user.specialite || '',
      numero_ordre: user.numero_ordre || '',
      password: '' // Ne pas afficher le mot de passe existant
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setSuccess('Utilisateur désactivé avec succès');
          fetchUsers();
        } else {
          setError(data.message || 'Erreur lors de la désactivation');
        }
      } catch (error) {
        setError('Erreur de connexion');
        console.error('Erreur:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      role: 'assistant',
      telephone: '',
      specialite: '',
      numero_ordre: '',
      password: ''
    });
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'medecin': return 'primary';
      case 'pharmacien': return 'warning';
      case 'assistant': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>👥 Gestion des Utilisateurs</h2>
              <p className="text-muted">Administration des comptes utilisateurs</p>
            </div>
            <Button 
              variant="primary"
              onClick={() => {
                setEditingUser(null);
                resetForm();
                setShowModal(true);
              }}
            >
              ➕ Nouvel Utilisateur
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Liste des Utilisateurs</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Nom & Prénom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Téléphone</th>
                    <th>Spécialité/Numéro</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id_utilisateur}>
                      <td>
                        <strong>{user.nom} {user.prenom}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={getRoleVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>{user.telephone || '-'}</td>
                      <td>
                        {user.specialite && (
                          <div className="small">{user.specialite}</div>
                        )}
                        {user.numero_ordre && (
                          <div className="small text-muted">{user.numero_ordre}</div>
                        )}
                      </td>
                      <td>
                        <Badge bg={user.actif ? 'success' : 'secondary'}>
                          {user.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(user)}
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(user.id_utilisateur)}
                            disabled={user.id_utilisateur === user.userId} // Empêche de se désactiver soi-même
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de création/édition */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel Utilisateur'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prénom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rôle *</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="assistant">Assistant</option>
                    <option value="medecin">Médecin</option>
                    <option value="pharmacien">Pharmacien</option>
                    <option value="admin">Administrateur</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                {!editingUser && (
                  <Form.Group className="mb-3">
                    <Form.Label>Mot de passe *</Form.Label>
                    <Form.Control
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingUser}
                      placeholder="Minimum 6 caractères"
                    />
                  </Form.Group>
                )}
              </Col>
            </Row>

            {(formData.role === 'medecin' || formData.role === 'pharmacien') && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Spécialité {formData.role === 'medecin' && '*'}</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.specialite}
                      onChange={(e) => setFormData({...formData, specialite: e.target.value})}
                      required={formData.role === 'medecin'}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Numéro d'ordre *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.numero_ordre}
                      onChange={(e) => setFormData({...formData, numero_ordre: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Modifier' : 'Créer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default UsersManagement;