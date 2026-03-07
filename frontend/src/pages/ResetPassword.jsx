// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { utilisateurService } from '../services/utilisateurService';
import NotificationToast from '../components/common/UI/NotificationToast';
import ConfirmationModal from '../components/common/UI/ConfirmationModal';
import { BsLock, BsShieldLock, BsShieldLockFill } from 'react-icons/bs';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer token depuis query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    if (!token) {
      setToast({ show: true, message: 'Lien de réinitialisation invalide ou expiré', type: 'danger' });
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setToast({ show: true, message: 'Veuillez remplir tous les champs', type: 'danger' });
      return;
    }

    if (password !== confirmPassword) {
      setToast({ show: true, message: 'Les mots de passe ne correspondent pas', type: 'danger' });
      return;
    }

    if (!token) {
      setToast({ show: true, message: 'Lien de réinitialisation invalide', type: 'danger' });
      return;
    }

    setConfirmModal({
      show: true,
      message: 'Confirmer la réinitialisation de votre mot de passe ?',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });
        setLoading(true);

        try {
          await utilisateurService.resetPassword(token, password);
          setToast({ show: true, message: ' Mot de passe réinitialisé avec succès ! Redirection...', type: 'success' });
          setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
          setToast({ show: true, message: err.message || 'Erreur lors de la réinitialisation', type: 'danger' });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Container fluid className="bg-light min-vh-100 d-flex align-items-center">
      <Row className="w-100 justify-content-center">
        <Col md={10} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <img
                  src="/src/assets/logo.jpg"
                  alt="Logo JIRAMA"
                  className="mb-4"
                  style={{ maxHeight: '100px' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h3 className="text-primary">CMS JIRAMA</h3>
                <p className="text-muted" style={{fontSize : '18px'}}>Centre Médico-Social</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label> <p style={{fontSize : '18px'}}>Nouveau mot de passe</p></Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsShieldLock size={28}/></span>
                  <Form.Control
                    style={{fontSize : '18px'}}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nouveau mot de passe..."
                    required
                    autoFocus
                    disabled={loading}
                  />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label> <p style={{fontSize : '18px'}}> Confirmer le mot de passe</p></Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsShieldLockFill size={28}/></span>
                  <Form.Control
                    style={{fontSize : '18px'}}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe..."
                    required
                    disabled={loading}
                  />
                  </div>
                </Form.Group>

                <Button 
                  variant="primary"
                  style={{fontSize : '20px'}} 
                  type="submit" 
                  className="w-100 py-2" 
                  disabled={loading || !token}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" /> Réinitialisation...
                    </>
                  ) : (
                    <>
                      Réinitialiser le mot de passe
                    </>
                  )}
                </Button>

                <div className="mt-3 text-center">
                  <strong
                    style={{ cursor: 'pointer', color: '#0d6efd' }}
                    onClick={() => navigate('/login')}
                  >
                     Retour à la connexion
                  </strong>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notification Toast */}
      <NotificationToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={confirmModal.show}
        message={confirmModal.message}
        type="info"
        onClose={() => setConfirmModal({ ...confirmModal, show: false })}
        onConfirm={confirmModal.onConfirm}
      />
    </Container>
  );
};

export default ResetPassword;
