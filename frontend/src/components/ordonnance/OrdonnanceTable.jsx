import React, { useState, useMemo } from 'react';
import { Table, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { BsSearch, BsXCircle, BsEye, BsPencil, BsTrash,BsClipboardData } from 'react-icons/bs';

const OrdonnanceTable = ({ ordonnances, onEdit, onDelete, onCreate, onView, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrdonnances = useMemo(() => {
    if (!searchQuery) return ordonnances;

    const lowerCaseQuery = searchQuery.toLowerCase();
    return ordonnances.filter(o =>
      (o.patient_nom && o.patient_nom.toLowerCase().includes(lowerCaseQuery)) ||
      (o.patient_prenom && o.patient_prenom.toLowerCase().includes(lowerCaseQuery)) ||
      (o.medecin_nom && o.medecin_nom.toLowerCase().includes(lowerCaseQuery)) ||
      (o.medecin_prenom && o.medecin_prenom.toLowerCase().includes(lowerCaseQuery)) ||
      (o.instructions && o.instructions.toLowerCase().includes(lowerCaseQuery)) ||
      (o.medicaments && o.medicaments.toLowerCase().includes(lowerCaseQuery)) ||
      (o.diagnostic && o.diagnostic.toLowerCase().includes(lowerCaseQuery)) ||
      (o.statut && o.statut.toLowerCase().includes(lowerCaseQuery))
    );
  }, [ordonnances, searchQuery]);

  const getStatutBadge = (statut) => {
    switch(statut) {
      case 'Validée':
        return <Badge bg="success">{statut}</Badge>;
      case 'Brouillon':
        return <Badge bg="secondary">{statut}</Badge>;
      case 'En préparation':
        return <Badge bg="warning" text="dark">{statut}</Badge>;
      case 'Délivrée':
        return <Badge bg="primary">{statut}</Badge>;
      case 'Annulée':
        return <Badge bg="danger">{statut}</Badge>;
      default:
        return <Badge bg="secondary">{statut || 'Non défini'}</Badge>;
    }
  };

  const getUrgenceBadge = (urgence) => {
    return urgence ? <Badge bg="danger" className="ms-1">Urgent</Badge> : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const stats = useMemo(() => ({
    validees: ordonnances.filter(o => o.statut === 'Validée').length,
    enPreparation: ordonnances.filter(o => o.statut === 'En préparation').length,
    urgentes: ordonnances.filter(o => o.urgence).length,
    delivrees: ordonnances.filter(o => o.statut === 'Délivrée').length,
    annulees: ordonnances.filter(o => o.statut === 'Annulée').length
  }), [ordonnances]);

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
        <Col md={8}>
          <Form.Group className="d-flex align-items-center">
            <BsSearch size={20} className="me-2 text-muted" />
            <Form.Control
              type="text"
              placeholder="Rechercher par patient, médecin, diagnostic ou statut..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <BsXCircle
                size={20}
                className="ms-2 text-danger"
                style={{ cursor: 'pointer' }}
                onClick={() => setSearchQuery('')}
                title="Effacer la recherche"
              />
            )}
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex justify-content-end">
          <Button variant="primary" onClick={onCreate} className="d-flex align-items-center gap-2">
            <BsClipboardData size={16} />
            Nouvelle Ordonnance
          </Button>
        </Col>
      </Row>

      {/* Tableau des ordonnances */}
      <div className="table-responsive">
        <Table striped bordered hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th width="80">#ID</th>
              <th>Patient</th>
              <th>Médecin</th>
              <th width="110">Date</th>
              <th width="130">Statut</th>
              <th>Diagnostic</th>
              <th>Médicaments</th>
              <th style={{ width: '150px' }} className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrdonnances.length > 0 ? (
              filteredOrdonnances.map(o => (
                <tr key={o.id_ordonnance}>
                  <td>
                   <div className="d-flex flex-column align-items-start">
                        #{o.id_ordonnance}
                      </div>
                  </td>
                  <td>
                    <div>
                      <strong>{o.patient_nom} {o.patient_prenom || ''}</strong>
                      {o.patient_prenom && (
                        <div>
                          <small className="text-muted">{o.patient_prenom}</small>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>Dr. {o.medecin_nom}</strong>
                      {o.medecin_prenom && (
                        <div>
                          <small className="text-muted">{o.medecin_prenom}</small>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <small>{formatDate(o.date_prescription)}</small>
                  </td>
                  <td>{getStatutBadge(o.statut)}</td>
                  <td>
                    {o.diagnostic ? (
                      <div 
                        className="text-truncate" 
                        style={{ maxWidth: '150px' }} 
                        title={o.diagnostic}
                      >
                        <small>{o.diagnostic}</small>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {o.medicaments ? (
                      <div 
                        className="text-truncate" 
                        style={{ maxWidth: '200px' }} 
                        title={o.medicaments}
                      >
                        <small>{o.medicaments}</small>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => onView(o)}
                        className="d-flex align-items-center gap-1"
                        title="Voir les détails"
                      >
                        <BsEye size={14} />
                        <span className="d-none d-md-inline">Détails</span>
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => onEdit(o)}
                        className="d-flex align-items-center gap-1"
                        title="Modifier l'ordonnance"
                      >
                        <BsPencil size={14} />
                        <span className="d-none d-md-inline">Modifier</span>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDelete(o.id_ordonnance)}
                        className="d-flex align-items-center gap-1"
                        title="Supprimer l'ordonnance"
                      >
                        <BsTrash size={14} />
                        <span className="d-none d-md-inline">Supprimer</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted py-5">
                  <div className="py-3">
                    <BsSearch size={48} className="text-muted mb-3" />
                    <p className="mb-1">
                      {ordonnances.length === 0 
                        ? 'Aucune ordonnance enregistrée' 
                        : 'Aucune ordonnance trouvée pour votre recherche'
                      }
                    </p>
                    {ordonnances.length === 0 && (
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={onCreate}
                        className="mt-2"
                      >
                        Créer la première ordonnance
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {ordonnances.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3 p-3 bg-light rounded">
          <div className="d-flex align-items-center gap-3">
            <small className="text-muted">
              Affichage de <strong>{filteredOrdonnances.length}</strong> ordonnance(s) sur <strong>{ordonnances.length}</strong> total
            </small>
            {searchQuery && (
              <Badge bg="outline-primary" className="border">
                Recherche: "{searchQuery}"
              </Badge>
            )}
          </div>

          <div className="d-flex gap-3">
            <small className="text-muted d-flex align-items-center gap-1">
              <Badge bg="success">{stats.validees}</Badge>
              validées
            </small>
            <small className="text-muted d-flex align-items-center gap-1">
              <Badge bg="warning" text="dark">{stats.enPreparation}</Badge>
              en prép.
            </small>
            <small className="text-muted d-flex align-items-center gap-1">
              <Badge bg="primary">{stats.delivrees}</Badge>
              délivrées
            </small>
            <small className="text-muted d-flex align-items-center gap-1">
              <Badge bg="danger">{stats.urgentes}</Badge>
              urgentes
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdonnanceTable;