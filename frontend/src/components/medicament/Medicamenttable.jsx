import React, { useState, useMemo } from 'react';
import { Table, Button, Form, Row, Col, Badge, Pagination } from 'react-bootstrap';
import { 
  BsSearch, 
  BsXCircle, 
  BsEye, 
  BsPencil, 
  BsTrash,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronLeft,
  BsChevronRight,
  BsCapsule
} from 'react-icons/bs';

const MedicamentTable = ({ medicaments, onEdit, onDelete, onCreate, onView, onRefresh, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredMedicaments = useMemo(() => {
    if (!searchQuery) return medicaments;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return medicaments.filter(m =>
      m.nom_commercial?.toLowerCase().includes(lowerCaseQuery) ||
      m.principe_actif?.toLowerCase().includes(lowerCaseQuery) ||
      m.dosage?.toLowerCase().includes(lowerCaseQuery) ||
      m.classe_therapeutique?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [medicaments, searchQuery]);


  const paginatedMedicaments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicaments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicaments, currentPage]);

  const totalPages = Math.ceil(filteredMedicaments.length / itemsPerPage);

  const getStockBadge = (medicament) => {
    if (medicament.stock_actuel <= 0) {
      return <Badge bg="danger">Rupture</Badge>;
    } else if (medicament.stock_actuel <= medicament.stock_minimum) {
      return <Badge bg="warning" text="dark">Stock bas</Badge>;
    } else {
      return <Badge bg="success">Disponible</Badge>;
    }
  };

  // Fonction pour le badge prescription
  const getPrescriptionBadge = (medicament) => {
    return medicament.prescription_restreinte 
      ? <Badge bg="danger">Ordonnance</Badge>
      : <Badge bg="secondary">Libre</Badge>;
  };

  const getPaginationItems = () => {
    const items = [];

    items.push(
      <Pagination.First
        key="first"
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="d-flex align-items-center"
      >
        <BsChevronDoubleLeft size={14} />
      </Pagination.First>
    );

    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="d-flex align-items-center"
      >
        <BsChevronLeft size={14} className="me-1" />
        Précédent
      </Pagination.Prev>
    );

    for (let page = 1; page <= totalPages; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="d-flex align-items-center"
      >
        Suivant
        <BsChevronRight size={14} className="ms-1" />
      </Pagination.Next>
    );

    items.push(
      <Pagination.Last
        key="last"
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
        className="d-flex align-items-center"
      >
        <BsChevronDoubleRight size={14} />
      </Pagination.Last>
    );

    return items;
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      <Row className="mb-4" style={{ marginTop : "15px"}}>
        <Col>
          <Form.Group className="d-flex align-items-center">
            <BsSearch size={20} className="me-2 text-muted" />
            <Form.Control
              type="text"
              placeholder="Rechercher par nom commercial, principe actif, dosage ou classe thérapeutique..."
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
              <BsCapsule size={20} /> Nouveau Médicament
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nom Commercial</th>
            <th>Principe Actif</th>
            <th>Dosage</th>
            <th>Classe</th>
            <th>Stock</th>
            <th>Prescription</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedMedicaments.length > 0 ? (
            paginatedMedicaments.map(medicament => (
              <tr key={medicament.id_medicament}>
                <td>#{medicament.id_medicament}</td>
                <td>
                  <strong>{medicament.nom_commercial}</strong>
                </td>
                <td>{medicament.principe_actif || '-'}</td>
                <td>{medicament.dosage || '-'}</td>
                <td>
                  {medicament.classe_therapeutique ? (
                    <Badge bg="primary" className="text-wrap">
                      {medicament.classe_therapeutique}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <div className="d-flex flex-column align-items-start">
                    {getStockBadge(medicament)}
                  </div>
                </td>
                <td>{getPrescriptionBadge(medicament)}</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onView(medicament)}
                      className="d-flex align-items-center gap-1"
                      style={{ minWidth: '80px' }}
                    >
                      <BsEye size={12} />
                      Détails
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onEdit(medicament)}
                      className="d-flex align-items-center gap-1"
                      style={{ minWidth: '80px' }}
                    >
                      <BsPencil size={12} />
                      Modifier
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDelete(medicament.id_medicament)}
                      className="d-flex align-items-center gap-1"
                      style={{ minWidth: '80px' }}
                    >
                      <BsTrash size={12} />
                      Supprimer
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted py-4">
                {medicaments.length === 0
                  ? 'Aucun médicament enregistré'
                  : 'Aucun médicament trouvé'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination et informations */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <small className="text-muted">
            Affichage de <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> à{' '}
            <strong>{Math.min(currentPage * itemsPerPage, filteredMedicaments.length)}</strong> sur{' '}
            <strong>{filteredMedicaments.length}</strong> médicament(s)
          </small>
        </div>
        
        {/* Indicateur stock critique */}
        {medicaments.filter(m => m.stock_actuel <= m.stock_minimum).length > 0 && (
          <Badge bg="warning" text="dark">
            {medicaments.filter(m => m.stock_actuel <= m.stock_minimum).length} médicament(s) en stock critique
          </Badge>
        )}
      </div>

      {/* Pagination */}
        {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination className="mb-0">
            {getPaginationItems()}
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default MedicamentTable;('')