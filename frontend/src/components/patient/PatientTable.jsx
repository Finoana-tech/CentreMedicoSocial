import React, { useState, useMemo } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import { BsSearch, BsXCircle, BsPencil, BsEye, BsTrash, BsPeople } from 'react-icons/bs';

const PatientTable = ({ patients, onEdit, onDelete, onCreate, onView, onRefresh, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return patients.filter(patient => 
      patient.nom?.toLowerCase().includes(lowerCaseQuery) ||
      patient.prenom?.toLowerCase().includes(lowerCaseQuery) ||
      patient.telephone?.includes(searchQuery) ||
      patient.email?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [patients, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
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
      {/* Barre de Recherche + Boutons */}
      <Row className="mb-4">
        <Col>
          <Form.Group className="d-flex align-items-center">
            <BsSearch size={20} className="me-2 text-muted" />
            <Form.Control
              type="text"
              placeholder="Rechercher par nom, prénom, téléphone ou email..."
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
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <Button 
            variant="primary" 
            onClick={onCreate} 
            //style={{ minWidth: '80px' }}
            >
            <BsPeople size={20}/> Nouveau Patient
          </Button>
        </Col>
      </Row>

      {/* Tableau des Patients */}
      <Table striped bordered hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nom & Prénom</th>
            <th>Date Naissance</th>
            <th>Sexe</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <tr key={patient.id_patient}>
                <td>#{patient.id_patient}</td>
                <td>
                  <strong>{patient.nom} {patient.prenom}</strong>
                </td>
                <td>{formatDate(patient.date_naissance)}</td>
                <td>{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</td>
                <td>{patient.telephone || '-'}</td>
                <td>{patient.email || '-'}</td>
                <td className="d-flex justify-content-center gap-1">
                  <Button 
                    variant="outline-info" 
                    size="sm" 
                    onClick={() => onView(patient)}
                    className="d-flex align-items-center gap-1"
                    style={{ minWidth: '80px' }}>
                      <BsEye size={12} />
                        Détails
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => onEdit(patient)}
                    className="d-flex align-items-center gap-1"
                    style={{ minWidth: '80px' }}>
                      <BsPencil size={12} />
                        Modifier
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => onDelete(patient.id_patient)}
                    className="d-flex align-items-center gap-1"
                    style={{ minWidth: '80px' }}>
                      <BsTrash size={12} />
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-muted py-4">
                {patients.length === 0 ? 'Aucun patient enregistré' : 'Aucun patient trouvé'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Résumé */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <small className="text-muted">
          {filteredPatients.length} patient(s) sur {patients.length} total
        </small>
      </div>
    </div>
  );
};

export default PatientTable;
