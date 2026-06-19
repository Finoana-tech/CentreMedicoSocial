import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { patientService } from '../../services/patientService';
import { medecinService } from '../../services/medecinService';
import { medicamentService } from '../../services/medicamentService';
import { Bs123, BsCalculator, BsCalendar, BsCalendarDate, BsCapsule, BsCash, BsClipboard, BsClipboardCheck, BsClipboardPulse, BsClockHistory, BsCodeSquare, BsCoin, BsDiamond, BsDroplet, BsFileMedical, BsHourglass, BsInfoCircle, BsInstagram, BsMusicNote, BsPencilSquare, BsPeople, BsPerson, BsSignTurnSlightRight, BsSortNumericDownAlt, BsTag } from 'react-icons/bs';

const initialLigne = { 
  id_medicament: '', 
  quantite_prescrite: '', 
  quantite_delivree: '', 
  date_delivrance: '',
  posologie: '',
  duree_traitement: 7,
  voie_administration: 'Orale',
  statut: 'prescrit',
  prix_unitaire: 0.00
};

const initialFormData = {
  id_patient: '',
  id_medecin: '',
  date_prescription: '',
  instructions: '',
  statut: 'Brouillon',
  diagnostic: '',
  renouvelable: false,
  nb_renouvellements_autorises: 0,
  duree_validite: 30,
  urgence: false,
  notes: '',
  created_by: 1,
  medicaments: [{ ...initialLigne }], 
};

const OrdonnanceForm = ({ show, onHide, ordonnance, onSubmit, loading }) => {
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [medicaments, setMedicaments] = useState([]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, m, meds] = await Promise.all([
          patientService.getAll(),
          medecinService.getAll(),
          medicamentService.getAll()
        ]);
        setPatients(p);
        setMedecins(m);
        setMedicaments(meds);
      } catch (err) {
        console.error('Erreur chargement données:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (show) {
      if (ordonnance) {
        console.log('Pré-remplissage édition - Données complètes:', JSON.stringify(ordonnance, null, 2));
        console.log('Médicaments reçus:', ordonnance.medicaments);
        
        setFormData({
          id_patient: ordonnance.id_patient || '',
          id_medecin: ordonnance.id_medecin || '',
          date_prescription: ordonnance.date_prescription ? 
            (ordonnance.date_prescription.split('T')[0] || '') : '',
          instructions: ordonnance.instructions || '',
          statut: ordonnance.statut || 'Brouillon',
          diagnostic: ordonnance.diagnostic || '',
          renouvelable: ordonnance.renouvelable || false,
          nb_renouvellements_autorises: ordonnance.nb_renouvellements_autorises || 0,
          duree_validite: ordonnance.duree_validite || 30,
          urgence: ordonnance.urgence || false,
          notes: ordonnance.notes || '',
          created_by: ordonnance.created_by || 1,
          medicaments: ordonnance.medicaments && Array.isArray(ordonnance.medicaments) && ordonnance.medicaments.length > 0 ? 
            ordonnance.medicaments.map(med => ({
              ...initialLigne,
              ...med,
              id_medicament: med.id_medicament || '',
              quantite_prescrite: med.quantite_prescrite || '',
              posologie: med.posologie || '',
              duree_traitement: med.duree_traitement || 7,
              voie_administration: med.voie_administration || 'Orale',
              statut: med.statut || 'prescrit',
              quantite_delivree: med.quantite_delivree || '',
              date_delivrance: med.date_delivrance || '',
              prix_unitaire: med.prix_unitaire || 0.00
            })) : 
            [{ ...initialLigne }],
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [ordonnance, show]);

  useEffect(() => {
    if (!show) {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMedicamentChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const medicaments = [...prev.medicaments];
      
      if (name === 'id_medicament') {
        const medicamentSelectionne = medicaments.find(med => med.id_medicament === parseInt(value));
        if (!medicamentSelectionne) {
          const medicamentInfo = medicaments.find(med => med.id_medicament === parseInt(value));
          if (medicamentInfo) {
            medicaments[index] = { 
              ...medicaments[index], 
              [name]: value,
              prix_unitaire: medicamentInfo.prix_unitaire || 0.00 
            };
          } else {
            medicaments[index] = { ...medicaments[index], [name]: value };
          }
        }
      } else {
        medicaments[index] = { 
          ...medicaments[index], 
          [name]: type === 'checkbox' ? checked : value 
        };
      }
      
      return { ...prev, medicaments };
    });

    const errorKey = `medicament_${index}_${name}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const getMedicamentInfo = (id_medicament) => {
    return medicaments.find(med => med.id_medicament === parseInt(id_medicament));
  };

  const addMedicament = () => {
    setFormData(prev => ({ 
      ...prev, 
      medicaments: [...prev.medicaments, { ...initialLigne }] 
    }));
  };

  const removeMedicament = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      medicaments: prev.medicaments.filter((_, i) => i !== index) 
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id_patient) newErrors.id_patient = 'Le patient est requis';
    if (!formData.id_medecin) newErrors.id_medecin = 'Le médecin est requis';
    if (!formData.date_prescription) newErrors.date_prescription = 'La date de prescription est requise';

    formData.medicaments.forEach((medicament, idx) => {
      if (!medicament.id_medicament) {
        newErrors[`medicament_${idx}_id_medicament`] = 'Sélectionner un médicament';
      }
      if (!medicament.quantite_prescrite || medicament.quantite_prescrite <= 0) {
        newErrors[`medicament_${idx}_quantite_prescrite`] = 'Quantité prescrite requise et > 0';
      }
      if (!medicament.posologie) {
        newErrors[`medicament_${idx}_posologie`] = 'La posologie est requise';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSubmit = {
        ...formData,
        nb_renouvellements_autorises: parseInt(formData.nb_renouvellements_autorises) || 0,
        duree_validite: parseInt(formData.duree_validite) || 30,
        medicaments: formData.medicaments.map(medicament => ({
          ...medicament,
          quantite_prescrite: parseInt(medicament.quantite_prescrite) || 0,
          quantite_delivree: parseInt(medicament.quantite_delivree) || 0,
          duree_traitement: parseInt(medicament.duree_traitement) || 7,
          prix_unitaire: parseFloat(medicament.prix_unitaire) || 0.00
        }))
      };
      
      console.log('Données soumises:', JSON.stringify(dataToSubmit, null, 2));
      onSubmit(dataToSubmit);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {ordonnance ? `Modifier Ordonnance #${ordonnance.id_ordonnance}` : 'Nouvelle Ordonnance'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Card className="p-3 shadow-sm">
            {/* Section Informations de base */}
            <h6 className="text-primary mb-3">Informations de Base</h6>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Patient </Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsPeople size={28}/></span>
                  <Form.Select
                    name="id_patient"
                    value={formData.id_patient}
                    onChange={handleChange}
                    isInvalid={!!errors.id_patient}
                    style={{fontSize :'18px'}}
                  >
                    <option value="" style={{fontSize :'18px'}}>-- Sélectionner Patient --</option>
                    {patients.map(p => (
                      <option key={p.id_patient} value={p.id_patient}>
                        {p.nom} {p.prenom} {p.date_naissance ? `(${new Date(p.date_naissance).getFullYear()})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                  </div>
                  <Form.Control.Feedback type="invalid">{errors.id_patient}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Médecin </Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsPerson size={28}/></span>
                  <Form.Select
                    name="id_medecin"
                    value={formData.id_medecin}
                    onChange={handleChange}
                    isInvalid={!!errors.id_medecin}
                    style={{fontSize :'18px'}}
                  >
                    <option value="" style={{fontSize :'18px'}}>-- Sélectionner Médecin --</option>
                    {medecins.map(m => (
                      <option key={m.id_medecin} value={m.id_medecin}>
                        {m.nom} {m.prenom} ({m.specialite})
                      </option>
                    ))}
                  </Form.Select>
                  </div>
                  <Form.Control.Feedback type="invalid">{errors.id_medecin}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date Prescription </Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsCalendar size={28}/></span>
                  <Form.Control
                    type="date"
                    name="date_prescription"
                    value={formData.date_prescription}
                    onChange={handleChange}
                    isInvalid={!!errors.date_prescription}
                    style={{fontSize :'18px'}}
                  />
                  </div>
                  <Form.Control.Feedback type="invalid">{errors.date_prescription}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Statut</Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsInfoCircle size={28}/></span>
                  <Form.Select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    style={{fontSize :'18px'}}
                  >
                    <option value="Brouillon"style={{fontSize :'18px'}}>Brouillon</option>
                    <option value="Validée" style={{fontSize :'18px'}}>Validée</option>
                    <option value="En préparation" style={{fontSize :'18px'}}>En préparation</option>
                    <option value="Délivrée" style={{fontSize :'18px'}}>Délivrée</option>
                    <option value="Annulée" style={{fontSize :'18px'}}>Annulée</option>
                  </Form.Select>
                  </div>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mt-4">
                  <Form.Check
                    type="checkbox"
                    name="urgence"
                    label="Ordonnance urgente"
                    checked={formData.urgence}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Section Informations médicales */}
            <h6 className="text-primary mb-3">Informations Médicales</h6>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Diagnostic</Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsFileMedical size={28}/></span>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="diagnostic"
                    value={formData.diagnostic}
                    onChange={handleChange}
                    placeholder="Diagnostic ou motif de la prescription..."
                    style={{fontSize :'18px'}}
                  />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Instructions</Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsClipboardCheck size={28}/></span>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Instructions particulières pour le patient..."
                    style={{fontSize :'18px'}}
                  />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsPencilSquare size={28}/></span>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Notes internes..."
                    style={{fontSize :'18px'}}
                  />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* Section Gestion renouvellements */}
            <h6 className="text-primary mb-3">Gestion des Renouvellements</h6>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    name="renouvelable"
                    label="Ordonnance renouvelable"
                    checked={formData.renouvelable}
                    onChange={handleChange}
                    
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Nombre de renouvellements autorisés</Form.Label>
                  
                  <Form.Control
                    type="number"
                    min="0"
                    max="12"
                    name="nb_renouvellements_autorises"
                    value={formData.nb_renouvellements_autorises}
                    onChange={handleChange}
                    disabled={!formData.renouvelable}
                    
                  />
                  
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Durée de validité (jours)</Form.Label>
                  <div className='input-group mb-3'>
                  <span className='input-group-text'><BsClockHistory size={28}/></span>
                  <Form.Control
                    type="number"
                    min="1"
                    max="365"
                    name="duree_validite"
                    value={formData.duree_validite}
                    onChange={handleChange}
                    style={{fontSize :'18px'}}
                  /></div>
                </Form.Group>
              </Col>
            </Row>

            {/* Section Médicaments */}
            <h6 className="text-primary mb-3">Médicaments Prescrits</h6>
            
            {formData.medicaments.map((medicament, index) => {
              const medicamentInfo = getMedicamentInfo(medicament.id_medicament);
              
              return (
                <Card key={index} className="mb-3 p-3 border-primary">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Médicament #{index + 1}</h6>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => removeMedicament(index)}
                      disabled={formData.medicaments.length === 1}
                    >
                       Supprimer
                    </Button>
                  </div>

                  {/* Affichage des infos du médicament sélectionné */}
                  {medicamentInfo && (
                    <Alert variant="info" className="py-2 mb-3">
                      <small>
                        <strong>Médicament sélectionné :</strong> {medicamentInfo.nom_commercial} - {medicamentInfo.principe_actif} - {medicamentInfo.dosage}
                        {medicamentInfo.prix_unitaire && (
                          <span className="ms-2">
                            <strong>Prix :</strong> {medicamentInfo.prix_unitaire} Ar
                          </span>
                        )}
                      </small>
                    </Alert>
                  )}

                  <Row className="align-items-end">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Médicament </Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsCapsule size={28}/></span>
                        <Form.Select
                          name="id_medicament"
                          value={medicament.id_medicament}
                          onChange={(e) => handleMedicamentChange(index, e)}
                          isInvalid={!!errors[`medicament_${index}_id_medicament`]}
                          style={{fontSize :'18px'}}
                        >
                          <option value="" style={{fontSize :'18px'}}>-- Sélectionner Médicament --</option>
                          {medicaments.map(m => (
                            <option key={m.id_medicament} 
                                    value={m.id_medicament}
                                    style={{fontSize :'18px'}}>
                              {m.nom_commercial} 
                            </option>
                          ))}
                        </Form.Select></div>
                        <Form.Control.Feedback type="invalid">
                          {errors[`medicament_${index}_id_medicament`]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Quantité Prescrite </Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsCalculator size={28}/></span>
                        <Form.Control
                          type="number"
                          min="1"
                          name="quantite_prescrite"
                          value={medicament.quantite_prescrite}
                          onChange={(e) => handleMedicamentChange(index, e)}
                          isInvalid={!!errors[`medicament_${index}_quantite_prescrite`]}
                          style={{fontSize :'18px'}}
                        /></div>
                        <Form.Control.Feedback type="invalid">
                          {errors[`medicament_${index}_quantite_prescrite`]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Posologie </Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsDroplet size={28}/></span>
                        <Form.Control
                          type="text"
                          name="posologie"
                          value={medicament.posologie}
                          onChange={(e) => handleMedicamentChange(index, e)}
                          isInvalid={!!errors[`medicament_${index}_posologie`]}
                          placeholder="Ex: 1 comprimé 3 fois par jour"
                          style={{fontSize :'18px'}}
                        /></div>
                        <Form.Control.Feedback type="invalid">
                          {errors[`medicament_${index}_posologie`]}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Durée (jours)</Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsClockHistory size={28}/></span>
                        <Form.Control
                          type="number"
                          min="1"
                          name="duree_traitement"
                          value={medicament.duree_traitement}
                          onChange={(e) => handleMedicamentChange(index, e)}
                          style={{fontSize :'18px'}}
                        /></div>
                      </Form.Group>
                    </Col>

                    <Col md={1}>
                      <Form.Group>
                        <Form.Label>Voie</Form.Label>
                        <Form.Select
                          name="voie_administration"
                          value={medicament.voie_administration}
                          onChange={(e) => handleMedicamentChange(index, e)}
                          style={{fontSize :'18px'}}
                        >
                          <option value="Orale" style={{fontSize :'18px'}}>Orale</option>
                          <option value="Injectable" style={{fontSize :'18px'}}>Injectable</option>
                          <option value="Cutanée" style={{fontSize :'18px'}}>Cutanée</option>
                          <option value="Inhalée" style={{fontSize :'18px'}}>Inhalée</option>
                          <option value="Ophtalmique" style={{fontSize :'18px'}}>Ophtalmique</option>
                          <option value="Auriculaire" style={{fontSize :'18px'}}>Auriculaire</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Ligne supplémentaire pour informations délivrance */}
                  <Row className="mt-3">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Quantité Délivrée</Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsCalculator size={28}/></span>
                        <Form.Control
                          type="number"
                          min="0"
                          name="quantite_delivree"
                          value={medicament.quantite_delivree}
                          onChange={(e) => handleMedicamentChange(index, e)}
                          style={{fontSize :'18px'}}
                        /></div>
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Date Délivrance</Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsCalendar size={28}/></span>
                        <Form.Control
                          type="date"
                          name="date_delivrance"
                          value={medicament.date_delivrance}
                          onChange={(e) => handleMedicamentChange(index, e)}
                          style={{fontSize :'18px'}}
                        /></div>
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Prix Unitaire (Ar)</Form.Label>
                        <div className='input-group mb-3'>
                        <span className='input-group-text'><BsCoin size={28}/></span>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="prix_unitaire"
                          value={medicament.prix_unitaire}
                          onChange={(e) => handleMedicamentChange(index, e)}
                          readOnly 
                          style={{fontSize :'18px'}}
                        /></div>
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Statut Ligne</Form.Label>
                        <Form.Select
                          name="statut"
                          value={medicament.statut}
                          onChange={(e) => handleMedicamentChange(index, e)}
                          style={{fontSize :'18px'}}
                        >
                          <option value="prescrit" style={{fontSize :'18px'}}>Prescrit</option>
                          <option value="en_preparation" style={{fontSize :'18px'}}>En préparation</option>
                          <option value="delivre" style={{fontSize :'18px'}}>Délivré</option>
                          <option value="partiel" style={{fontSize :'18px'}}>Partiel</option>
                          <option value="annule" style={{fontSize :'18px'}}>Annulé</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card>
              );
            })}

            <div className="text-center">
              <Button variant="outline-primary" className="mb-3" onClick={addMedicament}>
                 Ajouter un Médicament
              </Button>
            </div>

          </Card>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="px-4"
          >
            {loading ? 'Enregistrement...' : (ordonnance ? 'Modifier' : 'Créer Ordonnance')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default OrdonnanceForm;