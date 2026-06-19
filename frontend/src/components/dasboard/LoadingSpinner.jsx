import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  message = 'Chargement...',
  centered = false 
}) => {
  const spinner = (
    <div className={`d-flex align-items-center ${centered ? 'justify-content-center' : ''}`}>
      <Spinner 
        animation="border" 
        variant={variant} 
        size={size}
        className="me-2"
      />
      {message && <span className="text-muted">{message}</span>}
    </div>
  );

  if (centered) {
    return (
      <div className="d-flex justify-content-center align-items-center py-4">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const CardLoadingSpinner = () => (
  <div className="text-center py-3">
    <Spinner animation="border" variant="primary" size="sm" />
    <p className="text-muted small mt-2 mb-0">Chargement des données...</p>
  </div>
);

export const PageLoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
    <div className="text-center">
      <Spinner animation="border" variant="primary" size="lg" />
      <p className="text-muted mt-3">Chargement du tableau de bord...</p>
    </div>
  </div>
);

export const InlineLoadingSpinner = () => (
  <div className="d-flex align-items-center">
    <Spinner animation="border" variant="primary" size="sm" className="me-2" />
    <span className="text-muted small">Chargement...</span>
  </div>
);

export default LoadingSpinner;