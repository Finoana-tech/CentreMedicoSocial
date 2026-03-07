// src/components/rendez_vous/RendezVousTable.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Form, 
  Row, 
  Col, 
  Badge, 
  Card,
  Alert,
  InputGroup,
  Pagination
} from 'react-bootstrap';
import { 
  BsSearch, 
  BsXCircle, 
  BsEye, 
  BsPencil, 
  BsTrash, 
  BsCalendar,
  BsPlayCircle,
  BsCheckCircle,
  BsXCircleFill,
  BsClock
} from 'react-icons/bs';

const RendezVousTable = ({
  rendezVousList = [],
  onEdit,
  onDelete,
  onView,
  onCreate,
  onAnnuler,
  onStatusChange,
  loading = false,
  refreshData,
  error = null,
  userRole = 'assistant'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statutFilter, setStatutFilter] = useState('Tous');
  const [sortField, setSortField] = useState('date_heure');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [localLoading, setLocalLoading] = useState(false);
  const itemsPerPage = 10;
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const statutOptions = useMemo(() => 
    ['Tous', 'planifie', 'en_cours', 'termine', 'annule'].map(statut => (
      <option key={statut} value={statut}>
        {statut === 'planifie' ? 'Planifié' : 
         statut === 'en_cours' ? 'En Cours' :
         statut === 'termine' ? 'Terminé' :
         statut === 'annule' ? 'Annulé' : statut}
      </option>
    )), []);

  const filteredAndSortedRdv = useMemo(() => {
    if (!rendezVousList.length) return [];

    let filtered = [...rendezVousList];

    if (debouncedSearchQuery.trim()) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(rdv =>
        (rdv.patient_nom?.toLowerCase().includes(lowerQuery)) ||
        (rdv.patient_prenom?.toLowerCase().includes(lowerQuery)) ||
        (rdv.medecin_nom?.toLowerCase().includes(lowerQuery)) ||
        (rdv.medecin_prenom?.toLowerCase().includes(lowerQuery)) ||
        (rdv.date_heure?.toLowerCase().includes(lowerQuery)) ||
        (rdv.statut?.toLowerCase().includes(lowerQuery)) ||
        (rdv.motif?.toLowerCase().includes(lowerQuery))
      );
    }

    if (statutFilter !== 'Tous') {
      filtered = filtered.filter(rdv => rdv.statut === statutFilter);
    }

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'date_heure') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [rendezVousList, debouncedSearchQuery, statutFilter, sortField, sortDirection]);

  const paginatedRdv = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRdv.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedRdv, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedRdv.length / itemsPerPage);

  const handleSort = useCallback((field) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        return field;
      } else {
        setSortDirection('asc');
        return field;
      }
    });
  }, []);

  const getSortIcon = useCallback((field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <span className="ms-1">&#9650;</span> : <span className="ms-1">&#9660;</span>;
  }, [sortField, sortDirection]);

  const formatDateTime = useCallback((dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '-';
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return <div className="text-center"><div className="fw-semibold">{dateStr}</div><small className="text-muted">{timeStr}</small></div>;
    } catch {
      return '-';
    }
  }, []);

  const getStatutBadge = useCallback((statut) => {
    const variants = {
      'planifie': { bg: 'warning', text: 'Planifié' },
      'en_cours': { bg: 'info', text: 'En Cours' },
      'termine': { bg: 'success', text: 'Terminé' },
      'annule': { bg: 'danger', text: 'Annulé' }
    };
    const config = variants[statut] || { bg: 'secondary', text: statut };
    return <Badge bg={config.bg} className="px-2 py-1 rounded-pill">{config.text}</Badge>;
  }, []);

  const isRdvToday = useCallback((dateTimeString) => {
    if (!dateTimeString) return false;
    return new Date(dateTimeString).toDateString() === new Date().toDateString();
  }, []);

  const isRdvPassed = useCallback((dateTimeString) => {
    if (!dateTimeString) return false;
    return new Date(dateTimeString) < new Date();
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatutFilter('Tous');
    setCurrentPage(1);
  }, []);

  const shouldDisableActions = loading || localLoading;

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <div className="mt-2 text-muted">Chargement des rendez-vous...</div>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        {error && (
          <Alert variant="danger" className="d-flex justify-content-between align-items-center">
            <div><strong>Erreur:</strong> {error}</div>
            <Button variant="outline-danger" size="sm" onClick={refreshData} disabled={shouldDisableActions}>Réessayer</Button>
          </Alert>
        )}

        {/* Header style MedecinTable */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          {/*<h5 className="mb-0 fw-bold">
            <BsCalendar className="me-2" />
            Gestion des Rendez-Vous
          </h5> */}
          <Button variant="primary" onClick={onCreate} disabled={shouldDisableActions} className="d-flex align-items-center gap-2">
            <BsCalendar /> Nouveau RDV
          </Button>
        </div>

        <Row className="mb-3 g-3">
          <Col md={9}>
            <InputGroup>
              <InputGroup.Text className="bg-light"><BsSearch className="text-muted" /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Rechercher un patient, médecin ou motif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={shouldDisableActions}
              />
              {searchQuery && <Button variant="outline-secondary" onClick={clearFilters} disabled={shouldDisableActions}><BsXCircle /></Button>}
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} disabled={shouldDisableActions}>
              {statutOptions}
            </Form.Select>
          </Col>
        </Row>

        {filteredAndSortedRdv.length > 0 && (
          <div className="mb-3 text-muted small">
            {filteredAndSortedRdv.length} rendez-vous trouvés
          </div>
        )}

        <div>
          <Table striped bordered hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: '80px', cursor: 'pointer' }} onClick={() => handleSort('id_rendez_vous')}>ID {getSortIcon('id_rendez_vous')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('patient_nom')}>Patient {getSortIcon('patient_nom')}</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('medecin_nom')}>Médecin {getSortIcon('medecin_nom')}</th>
                <th style={{ width: '140px', cursor: 'pointer' }} onClick={() => handleSort('date_heure')} className="text-center">Date/Heure {getSortIcon('date_heure')}</th>
                <th style={{ width: '120px' }} className="text-center">Statut</th>
                <th style={{ width: '150px' }}>Motif</th>
                <th style={{ width: '150px' }} className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRdv.length > 0 ? paginatedRdv.map(rdv => (
                <tr key={rdv.id_rendez_vous}>
                  <td>#{rdv.id_rendez_vous}</td>
                  <td>{rdv.patient_prenom} {rdv.patient_nom}<br/><small className="text-muted">{rdv.patient_telephone || 'Tél. non renseigné'}</small></td>
                  <td>Dr {rdv.medecin_prenom} {rdv.medecin_nom}<br/><small className="text-muted">{rdv.medecin_specialite || 'Généraliste'}</small></td>
                  <td>{formatDateTime(rdv.date_heure)}</td>
                  <td className="text-center">{getStatutBadge(rdv.statut)}</td>
                  <td><div className="text-truncate" style={{ maxWidth: '150px' }} title={rdv.motif}>{rdv.motif || 'Aucun motif'}</div></td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Button variant="outline-info"
                       size="sm" 
                       onClick={() => onView(rdv)}
                        disabled={shouldDisableActions}
                        className="d-flex align-items-center gap-1"
                        style={{ minWidth: '80px' }}
                      >
                        <BsEye size={12}/>
                          Details
                        </Button>
                      <Button variant="outline-secondary" 
                      size="sm" 
                      onClick={() => onEdit(rdv)} disabled={shouldDisableActions}
                      className="d-flex align-items-center gap-1"
                        style={{ minWidth: '80px' }}
                      >
                        <BsPencil size={12} />
                          Modifier
                        </Button>
                      <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => onDelete(rdv.id_rendez_vous)} 
                      disabled={shouldDisableActions}
                      className="d-flex align-items-center gap-1"
                        style={{ minWidth: '80px' }}
                      >
                        <BsTrash size={12} />
                          Supprimer
                        </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="text-muted">
                      <h5>Aucun rendez-vous trouvé</h5>
                      {rendezVousList.length === 0 ? 'Commencez par créer votre premier rendez-vous' : 'Aucun résultat ne correspond à vos critères de recherche'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredAndSortedRdv.length)} sur {filteredAndSortedRdv.length} rendez-vous
            </small>
            <Pagination className="mb-0">
              <Pagination.Prev disabled={currentPage === 1 || shouldDisableActions} onClick={() => setCurrentPage(currentPage - 1)} />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => setCurrentPage(index + 1)} disabled={shouldDisableActions}>
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next disabled={currentPage === totalPages || shouldDisableActions} onClick={() => setCurrentPage(currentPage + 1)} />
            </Pagination>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default React.memo(RendezVousTable);
