// src/pages/Login.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationToast from '../components/common/UI/NotificationToast';
import { BsEnvelope,  BsArrowRightCircle, BsShieldLock } from 'react-icons/bs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirection après login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setToast({ show: true, message: 'Veuillez remplir tous les champs', type: 'danger' });
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setToast({ show: true, message: result.message || 'Erreur de connexion', type: 'danger' });
      }
    } catch (err) {
      setToast({ show: true, message: err.message || 'Une erreur est survenue lors de la connexion', type: 'danger' });
      console.error('Erreur détaillée:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) handleSubmit(e);
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
                <p className="text-muted" style={{ fontSize: '20px' }}>Centre Médico-Social</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label> <p style={{fontSize : '18px'}}> Email</p></Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsEnvelope size={28}/></span>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="exemple@jirama.com"
                    style={{fontSize : '18px'}}
                    required
                    autoFocus
                    disabled={loading}
                  />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><p style={{fontSize : '18px'}}>Mot de passe</p></Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsShieldLock size={28}/></span>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Votre mot de passe..."
                    style={{fontSize : '18px'}}
                    required
                    disabled={loading}
                  />
                  </div>
                </Form.Group> <br/>

                <Button
                  style={{fontSize : '20px'}}
                  variant="primary"
                  type="submit"
                  className="w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Connexion...
                    </>
                  ) : (
                    <>
                        Se connecter  <BsArrowRightCircle size={35}/>
                    </>
                    
                  )}
                </Button>

                <div className="mt-3 text-center">
                  <strong
                    style={{ cursor: 'pointer', color: '#0d6efd' }}
                    onClick={() => navigate('/forgot-password')}
                  >
                    Mot de passe oublié
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
    </Container>
  );
};

export default Login;
