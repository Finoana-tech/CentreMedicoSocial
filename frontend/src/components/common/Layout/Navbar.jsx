import React from 'react';
import { Navbar as BsNavbar, Container, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import { BsArrow90DegLeft } from 'react-icons/bs';

const CustomNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BsNavbar bg="white" variant="light" className="shadow-sm">
      <Container fluid>
        <BsNavbar.Brand>
          <h4 className="mb-0 text-primary">Centre Médico-Social JIRAMA</h4>
        </BsNavbar.Brand>

        <Nav className="ms-auto d-flex align-items-center">
          <span className="me-3 text-muted" style={{fontSize : '18px'}}>
            Bienvenue, <strong>{user?.role || user?.nom || user?.name || 'Utilisateur'}</strong>
          </span>
          <Button 
            variant="outline-secondary"
            size="sm" 
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt me-1"></i>
            Déconnexion
          </Button>
        </Nav>
      </Container>
    </BsNavbar>
  );
};

export default CustomNavbar;
