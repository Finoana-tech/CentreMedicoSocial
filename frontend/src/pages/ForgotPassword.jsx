// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { utilisateurService } from '../services/utilisateurService';
import { useNavigate } from 'react-router-dom';
import NotificationToast from '../components/common/UI/NotificationToast';
import ConfirmationModal from '../components/common/UI/ConfirmationModal';
import { BsEnvelope, BsSend } from 'react-icons/bs';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setToast({ show: true, message: 'Veuillez renseigner votre email', type: 'danger' });
      return;
    }

    setConfirmModal({
      show: true,
      message: `Confirmer l'envoi du lien de réinitialisation pour "${email}" ?`,
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, show: false });
        setLoading(true);

        try {
          const result = await utilisateurService.requestPasswordReset(email.trim().toLowerCase());

          if (result.success) {
            setToast({
              show: true,
              message: ' Un email de réinitialisation a été envoyé si l’adresse existe.',
              type: 'success'
            });

            // ⚡ Redirection vers reset-password avec token simulé
            setTimeout(() => {
              navigate(`/reset-password?token=${encodeURIComponent(result.token)}&email=${encodeURIComponent(email.trim().toLowerCase())}`);
            }, 2000);
          } else {
            setToast({
              show: true,
              message: result.message || 'Erreur lors de la demande de réinitialisation',
              type: 'danger'
            });
          }
        } catch (err) {
          setToast({
            show: true,
            message: err.message || 'Une erreur est survenue',
            type: 'danger'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <Container fluid className="bg-light min-vh-100 d-flex align-items-center">
      <Row className="w-100 justify-content-center">
        <Col md={10} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              {/* Logo */}
              <div className="text-center mb-4">
                <img
                  src="/src/assets/logo.jpg"
                  alt="Logo JIRAMA"
                  className="mb-4"
                  style={{ maxHeight: '100px' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <h3 className="text-primary">CMS JIRAMA</h3>
                <p className="text-muted" style={{fontSize : '20px'}}>Centre Médico-Social</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label><p style={{fontSize : '18px'}}> Email</p></Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsEnvelope size={28}/></span>
                  <Form.Control
                    type="email"
                    style={{fontSize : '18px'}}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="exemple@jirama.com"
                    required
                    autoFocus
                    disabled={loading}
                  />
                  </div>
                </Form.Group> <br />

                <Button variant="primary" 
                  type="submit" 
                  className="w-100 py-2" 
                  disabled={loading} 
                  style={{fontSize : '20px'}}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le lien de réinitialisation 
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

export default ForgotPassword;
