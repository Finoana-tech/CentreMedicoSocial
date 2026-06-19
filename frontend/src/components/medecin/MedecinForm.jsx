import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { BsEnvelope, BsPhone } from 'react-icons/bs';

const initialMedecinState = {
  nom: '',
  prenom: '',
  specialite: '',
  telephone: '',
  email: '',
  adresse: '',
  disponibilite: 'disponible'
};

const MedecinForm = ({ show, onHide, medecin, onSubmit, loading }) => {
  const [formData, setFormData] = useState(initialMedecinState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (medecin) {
      setFormData({
        nom: medecin.nom || '',
        prenom: medecin.prenom || '',
        specialite: medecin.specialite || '',
        telephone: medecin.telephone || '',
        email: medecin.email || '',
        adresse: medecin.adresse || '',
        disponibilite: medecin.disponibilite || 'disponible'
      });
    } else {
      setFormData(initialMedecinState);
    }
    setErrors({});
  }, [medecin, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.specialite.trim()) newErrors.specialite = 'La spécialité est requise';

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

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
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{medecin ? 'Modifier le Médecin' : 'Ajouter Nouveau Médecin'}</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nom </Form.Label>
                <Form.Control
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  isInvalid={!!errors.nom}
                  placeholder="Entrez le nom..."
                  style={{fontSize : '18px'}}
                />
                <Form.Control.Feedback type="invalid">{errors.nom}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Prénom </Form.Label>
                <Form.Control
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  isInvalid={!!errors.prenom}
                  placeholder="Entrez le prénom..."
                  style={{fontSize : '18px'}}
                />
                <Form.Control.Feedback type="invalid">{errors.prenom}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Spécialité </Form.Label>
                <Form.Control
                  type="text"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleInputChange}
                  isInvalid={!!errors.specialite}
                  placeholder="Ex: Cardiologie, Neurologie..."
                  style={{fontSize : '18px'}}
                />
                <Form.Control.Feedback type="invalid">{errors.specialite}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Téléphone</Form.Label>
                <div className='input-group mb-3'>
                <span className='input-group-text'><BsPhone size={28}/></span>
                <Form.Control
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  placeholder="+261 32 12 345 67"
                  style={{fontSize :'18px'}}
                />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <div className='input-group mb-3'>
                <span className='input-group-text'><BsEnvelope size={28}/></span>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                  placeholder="exemple@gmail.com"
                  style={{fontSize : '18px'}}
                />
                </div>
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Disponibilité</Form.Label>
                <Form.Select
                  name="disponibilite"
                  value={formData.disponibilite}
                  onChange={handleInputChange}
                  style={{fontSize :'18px'}}
                >
                  <option value="disponible" style={{fontSize :'18px'}}>Disponible</option>
                  <option value="en_consultation" style={{fontSize :'18px'}}>En consultation</option>
                  <option value="pause" style={{fontSize :'18px'}}>Pause</option>
                  <option value="chirurgie" style={{fontSize :'18px'}}>Chirurgie</option>
                  <option value="hors_service" style={{fontSize :'18px'}}>Hors service</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Adresse complète..."
                  style={{fontSize : '18px'}}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Annuler</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : (medecin ? 'Enregistrer' : 'Créer Médecin')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MedecinForm;