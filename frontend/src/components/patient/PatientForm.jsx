import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { BsCalendar, BsEnvelope, BsGenderAmbiguous, BsGenderNeuter, BsLock, BsPeople, BsPhone, BsShieldLock, BsShieldLockFill } from 'react-icons/bs';

const initialPatientState = {
  nom: '',
  prenom: '',
  date_naissance: '',
  sexe: 'M',
  adresse: '',
  telephone: '',
  email: '',
  type_patient: 'employe', 
  id_tuteur: '',
  lien_familial: ''
};

const PatientForm = ({ show, onHide, patient, onSubmit, loading }) => {
  const [formData, setFormData] = useState(initialPatientState);
  const [errors, setErrors] = useState({});
  const [employes, setEmployes] = useState([]);

  useEffect(() => {
    if (show) {
      fetch('http://localhost:5000/api/patient/tuteurs/potentiels')
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            setEmployes(result.data);
          }
        })
        .catch(error => console.error('Erreur chargement employés:', error));
    }
  }, [show]);

  useEffect(() => {
    if (patient) {
      setFormData({
        nom: patient.nom || '',
        prenom: patient.prenom || '',
        date_naissance: patient.date_naissance ? patient.date_naissance.split('T')[0] : '',
        sexe: patient.sexe || 'M',
        adresse: patient.adresse || '',
        telephone: patient.telephone || '',
        email: patient.email || '',
        type_patient: patient.id_tuteur ? 'famille' : 'employe',
        id_tuteur: patient.id_tuteur || '',
        lien_familial: patient.lien_familial || ''
      });
    } else {
      setFormData(initialPatientState);
    }
    setErrors({});
  }, [patient, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.date_naissance) newErrors.date_naissance = 'La date de naissance est requise';
    if (!formData.sexe) newErrors.sexe = 'Le sexe est requis';
    
    //  MODIFICATION: Adresse obligatoire pour tous
    if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est requise";

    // Email et téléphone OBLIGATOIRES pour les employés
    if (formData.type_patient === 'employe') {
      if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis pour les employés';
      if (!formData.email.trim()) newErrors.email = "L'email est requis pour les employés";
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    }

    // Email et téléphone OPTIONNELS pour les membres de famille
    if (formData.type_patient === 'famille') {
      if (formData.email && formData.email.trim() !== '' && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    }

    if (formData.type_patient === 'famille') {
      if (!formData.lien_familial) newErrors.lien_familial = 'Le lien familial est requis';
      if (!formData.id_tuteur) newErrors.id_tuteur = "L'employé responsable est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      if (formData.type_patient === 'employe') {
        submitData.id_tuteur = null;
        submitData.lien_familial = '';
      }
      onSubmit(submitData);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <div className='d-flex justify-content-aligns'>
          <span><BsPeople size={28}/></span>
          <Modal.Title>{patient ? 'Modifier le Patient' : 'Ajouter Nouveau Patient'}</Modal.Title>
        </div>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Card className="p-3 shadow-sm">
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nom </Form.Label>
                  <Form.Control
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    isInvalid={!!errors.nom}
                    placeholder='Entrez votre nom'
                    style={{fontSize : '18px'}}
                  />
                  <Form.Control.Feedback type="invalid">{errors.nom}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Prénom </Form.Label>
                  <Form.Control
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    isInvalid={!!errors.prenom}
                    placeholder='Enrez votre prenom'
                    style={{fontSize : '18px'}}
                  />
                  <Form.Control.Feedback type="invalid">{errors.prenom}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date de Naissance </Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsCalendar size={28}/></span>
                  <Form.Control
                    type="date"
                    name="date_naissance"
                    value={formData.date_naissance}
                    onChange={handleInputChange}
                    isInvalid={!!errors.date_naissance}
                    style={{fontSize :'18px'}}
                  /></div>
                  <Form.Control.Feedback type="invalid" style={{fontSize :'18px'}}>{errors.date_naissance}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Sexe </Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsGenderNeuter size={28}/></span>
                  <Form.Select
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleInputChange}
                    isInvalid={!!errors.sexe}
                    style={{fontSize :'18px'}}
                  >
                    <option value="M" style={{fontSize :'18px'}}>Masculin</option>
                    <option value="F" style={{fontSize :'18px'}}>Féminin</option>
                  </Form.Select></div>
                  <Form.Control.Feedback type="invalid">{errors.sexe}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Téléphone {formData.type_patient === 'employe' && ''}
                  </Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsPhone size={28}/></span>
                  <Form.Control
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    isInvalid={!!errors.telephone}
                    placeholder={formData.type_patient === 'famille' ? "Optionnel" : "+261 34 12 345 67"}
                    style={{fontSize :'18px'}}
                  />
                  <Form.Control.Feedback type="invalid">{errors.telephone}</Form.Control.Feedback>
                  {formData.type_patient === 'famille' && (
                    <Form.Text className="text-muted">
                      Champ optionnel pour les membres de famille
                    </Form.Text>
                  )}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Email {formData.type_patient === 'employe' && ''}
                  </Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsEnvelope size={28}/></span>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    placeholder={formData.type_patient === 'famille' ? "Optionnel" : "exemple@jirama.com"}
                    style={{fontSize : '18px'}}
                  />
                  </div>
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  {formData.type_patient === 'famille' && (
                    <Form.Text className="text-muted">
                      Champ optionnel pour les membres de famille
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              {/*  MODIFICATION: Adresse obligatoire pour tous */}
              <Form.Label>Adresse </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                isInvalid={!!errors.adresse}
                placeholder="Entrez l'adresse complète"
                style={{fontSize : '18px'}}
              />
              <Form.Control.Feedback type="invalid">{errors.adresse}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type de Patient </Form.Label>
              <Form.Select
                name="type_patient"
                value={formData.type_patient}
                onChange={handleInputChange}
                style={{fontSize :'18px'}}
              >
                <option value="employe" style={{fontSize :'18px'}}>Employé</option>
                <option value="famille" style={{fontSize :'18px'}}>Membre de la famille</option>
              </Form.Select>
            </Form.Group>

            {formData.type_patient === 'famille' && (
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Lien Familial </Form.Label>
                    <Form.Select
                      name="lien_familial"
                      value={formData.lien_familial}
                      onChange={handleInputChange}
                      isInvalid={!!errors.lien_familial}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Conjoint">Conjoint</option>
                      <option value="Enfant">Enfant</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.lien_familial}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Employé Responsable </Form.Label>
                    <Form.Select
                      name="id_tuteur"
                      value={formData.id_tuteur}
                      onChange={handleInputChange}
                      isInvalid={!!errors.id_tuteur}
                    >
                      <option value="">Sélectionnez un employé</option>
                      {employes.map(employe => (
                        <option key={employe.id_patient} value={employe.id_patient}>
                          {employe.nom} {employe.prenom}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.id_tuteur}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Card>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Annuler</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : (patient ? 'Enregistrer' : 'Créer Patient')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PatientForm;