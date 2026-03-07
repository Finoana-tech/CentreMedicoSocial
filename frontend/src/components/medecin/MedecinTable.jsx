// src/components/medecin/MedecinTable.jsx
import React, { useState, useMemo } from 'react';
import { Table, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { BsSearch, BsXCircle, BsPersonVcard, BsEye, BsPencil, BsTrash } from 'react-icons/bs';

const MedecinTable = ({ medecins, onEdit, onDelete, onCreate, onView, onRefresh, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMedecins = useMemo(() => {
    if (!searchQuery) return medecins;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return medecins.filter(medecin =>
      medecin.nom?.toLowerCase().includes(lowerCaseQuery) ||
      medecin.prenom?.toLowerCase().includes(lowerCaseQuery) ||
      medecin.specialite?.toLowerCase().includes(lowerCaseQuery) ||
      medecin.telephone?.includes(searchQuery) ||
      medecin.adresse?.toLowerCase().includes(lowerCaseQuery) ||
      medecin.email?.toLowerCase().includes(lowerCaseQuery) ||
      medecin.disponibilite?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [medecins, searchQuery]);

  const getDisponibiliteBadgeVariant = (disponibilite) => {
    switch (disponibilite) {
      case 'disponible': return 'success';
      case 'en_consultation': return 'warning';
      case 'pause': return 'info';
      case 'chirurgie': return 'danger';
      case 'hors_service': return 'secondary';
      default: return 'light';
    }
  };

  const getDisponibiliteText = (disponibilite) => {
    switch (disponibilite) {
      case 'disponible': return 'Disponible';
      case 'en_consultation': return 'En consultation';
      case 'pause': return 'Pause';
      case 'chirurgie': return 'Chirurgie';
      case 'hors_service': return 'Hors service';
      default: return disponibilite;
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <Form.Group className="d-flex align-items-center">
            <BsSearch size={20} className="me-2 text-muted" />
            <Form.Control
              type="text"
              placeholder="Rechercher par nom, prénom, spécialité, téléphone, adresse, email ou disponibilité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <BsXCircle 
                size={20} 
                className="ms-2 text-danger" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setSearchQuery('')}
              />
            )}
          </Form.Group>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="primary" onClick={onCreate}>
            <BsPersonVcard size={20} /> Nouveau Médecin
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nom & Prénom</th>
            <th>Spécialité</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th style={{ width: '150px' }} className='d-flex align-items-center gap-1 justify-content-center' >
              Disponibilité
            </th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMedecins.length > 0 ? (
            filteredMedecins.map(medecin => (
              <tr key={medecin.id_medecin || medecin.id}>
                <td><strong>#{medecin.id_medecin || medecin.id}</strong></td>
                <td><strong>{medecin.nom} {medecin.prenom}</strong></td>
                <td>{medecin.specialite || '-'}</td>
                <td>{medecin.telephone || '-'}</td>
                <td>{medecin.email || '-'}</td>
                <td style={{ width: '150px', textAlign: 'center' }}>
                  <Badge bg={getDisponibiliteBadgeVariant(medecin.disponibilite)}
                  className="w-100 d-flex justify-content-center align-items-center"
                    style={{ 
                      minHeight: '20px',
                      fontSize: '0.8rem',
                      padding: '4px 8px ',
                      minWidth: '80px',
                      maxWidth: '100px',
                      width: '100%',
                      //justifyContent: 'center'
                    }}>
                    {getDisponibiliteText(medecin.disponibilite)}
                  </Badge>
                </td>
                <td className="d-flex justify-content-center gap-1">
                  <Button 
                    variant="outline-info"
                    size="sm" 
                    onClick={() => onView(medecin)}
                    className="d-flex align-items-center gap-1"
                    style={{ minWidth: '80px' }}
                  >
                    <BsEye size={12} />
                    Détails
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"  
                    onClick={() => onEdit(medecin)}
                    className="d-flex align-items-center gap-1"
                    style={{ minWidth: '80px' }}
                  >
                    <BsPencil size={12} />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => onDelete(medecin.id_medecin || medecin.id)}
                    className="d-flex align-items-center gap-1"
                    style={{ minWidth: '80px' }}
                  >
                    <BsTrash size={12} />   
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-muted py-4">
                {medecins.length === 0 ? 'Aucun médecin enregistré' : 'Aucun médecin trouvé'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <small className="text-muted">
          {filteredMedecins.length} médecin(s) sur {medecins.length} total
        </small>
      </div>
    </div>
  );
};

export default MedecinTable;