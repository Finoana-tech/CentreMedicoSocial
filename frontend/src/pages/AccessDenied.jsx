import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsLockFill } from 'react-icons/bs';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="text-center shadow p-4">
        <BsLockFill size={60} className="mb-3 text-danger" />
        <h3 className="mb-3">Accès refusé</h3>
        <p>Votre rôle actuel ne vous permet pas d’accéder à cette page.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Retour au tableau de bord
        </Button>
      </Card>
    </Container>
  );
};

export default AccessDenied;
