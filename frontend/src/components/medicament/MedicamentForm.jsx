import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Card } from 'react-bootstrap';

const initialMedicamentState = {
  nom_commercial: '',
  principe_actif: '',
  dosage: '',
  classe_therapeutique: '',
  prescription_restreinte: false,
  stock_actuel: 0,
  stock_minimum: 5,
  prix_unitaire: 0.00,
  conditions_conservation: 'Ambiance',
  posologie_standard: ''
};

const MedicamentForm = ({ show, onHide, medicament, onSubmit, loading }) => {
  const [formData, setFormData] = useState(initialMedicamentState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (medicament) {
      setFormData({
        nom_commercial: medicament.nom_commercial || '',
        principe_actif: medicament.principe_actif || '',
        dosage: medicament.dosage || '',
        classe_therapeutique: medicament.classe_therapeutique || '',
        prescription_restreinte: medicament.prescription_restreinte || false,
        stock_actuel: medicament.stock_actuel || 0,
        stock_minimum: medicament.stock_minimum || 5,
        prix_unitaire: medicament.prix_unitaire || 0.00,
        conditions_conservation: medicament.conditions_conservation || 'Ambiance',
        posologie_standard: medicament.posologie_standard || ''
      });
    } else {
      setFormData(initialMedicamentState);
    }
    setErrors({});
  }, [medicament, show]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom_commercial.trim()) newErrors.nom_commercial = 'Le nom commercial est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {medicament ? 'Modifier le Médicament' : 'Ajouter un Nouveau Médicament'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Card className="p-3 shadow-sm">
            {/* Section Informations de base - inchangée */}
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Nom Commercial *</Form.Label>
                  <Form.Control
                    type="text"
                    name="nom_commercial"
                    value={formData.nom_commercial}
                    onChange={handleInputChange}
                    isInvalid={!!errors.nom_commercial}
                    placeholder="Ex: Doliprane, Paracétamol..."
                  />
                  <Form.Control.Feedback type="invalid">{errors.nom_commercial}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Principe Actif</Form.Label>
                  <Form.Control
                    type="text"
                    name="principe_actif"
                    value={formData.principe_actif}
                    onChange={handleInputChange}
                    placeholder="Ex: Paracétamol, Ibuprofène..."
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Dosage</Form.Label>
                  <Form.Control
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    placeholder="Ex: 500 mg, 1 g..."
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* NOUVELLE SECTION : Informations médicales */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Classe Thérapeutique</Form.Label>
                  <Form.Select
                    name="classe_therapeutique"
                    value={formData.classe_therapeutique}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner une classe</option>
                    <option value="Antalgique">Antalgique</option>
                    <option value="Antibiotique">Antibiotique</option>
                    <option value="Anti-inflammatoire">Anti-inflammatoire</option>
                    <option value="Antihypertenseur">Antihypertenseur</option>
                    <option value="Antidiabétique">Antidiabétique</option>
                    <option value="Antidépresseur">Antidépresseur</option>
                    <option value="Vitamine">Vitamine</option>
                    <option value="Autre">Autre</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mt-4">
                  <Form.Check
                    type="checkbox"
                    name="prescription_restreinte"
                    label="Prescription médicale obligatoire"
                    checked={formData.prescription_restreinte}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* NOUVELLE SECTION : Gestion de stock */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Stock Actuel</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_actuel"
                    value={formData.stock_actuel}
                    onChange={handleInputChange}
                    min="0"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Stock Minimum</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock_minimum"
                    value={formData.stock_minimum}
                    onChange={handleInputChange}
                    min="1"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Prix Unitaire (Ar)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="prix_unitaire"
                    value={formData.prix_unitaire}
                    onChange={handleInputChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* NOUVELLE SECTION : Conservation et posologie */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Conditions de Conservation</Form.Label>
                  <Form.Select
                    name="conditions_conservation"
                    value={formData.conditions_conservation}
                    onChange={handleInputChange}
                  >
                    <option value="Ambiance">Température ambiante</option>
                    <option value="Frigo">Au réfrigérateur (2-8°C)</option>
                    <option value="Congélateur">Au congélateur</option>
                    <option value="Sec">Endroit sec</option>
                    <option value="Obscurité">À l'abri de la lumière</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Posologie Standard</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="posologie_standard"
                    value={formData.posologie_standard}
                    onChange={handleInputChange}
                    placeholder="Ex: 1 comprimé 3 fois par jour pendant 7 jours. Maximum 3g par jour."
                  />
                  <Form.Text className="text-muted">
                    Instructions standard pour les prescriptions
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Card>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Annuler</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : (medicament ? 'Enregistrer' : 'Créer Médicament')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MedicamentForm;