import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { utilisateurService } from "../../services/utilisateurService";
import medecinService from '../../services/medecinService';
import { BsEnvelope, BsLock, BsPersonGear, BsShieldLock } from 'react-icons/bs';

const UtilisateurForm = ({ show, onHide, user, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('assistant');
  const [actif, setActif] = useState(true);
  const [motDePasse, setMotDePasse] = useState('');
  const [idMedecin, setIdMedecin] = useState('');
  const [loading, setLoading] = useState(false);

  const [medecins, setMedecins] = useState([]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setRole(user.role || 'assistant');
      setActif(user.actif ?? true);
      setIdMedecin(user.id_medecin || '');
      setMotDePasse('');
    } else {
      setEmail('');
      setRole('assistant');
      setActif(true);
      setIdMedecin('');
      setMotDePasse('');
    }
  }, [user]);

  useEffect(() => {
    medecinService.getAll()
      .then(setMedecins)
      .catch(err => console.error('Erreur chargement médecins:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      email,
      role,
      actif: Boolean(actif), 
    };

    if (role === 'medecin' && idMedecin) {
      payload.id_medecin = Number(idMedecin); 
    }

    if (motDePasse.trim()) {
      payload.mot_de_passe = motDePasse;
    } else if (!user) {
      alert("Le mot de passe est obligatoire pour créer un utilisateur");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (user) {
        result = await utilisateurService.updateUser(user.id_utilisateur, payload);
      } else {
        result = await utilisateurService.createUser(payload);
      }

      onSuccess(result);
      onHide();
    } catch (error) {
      console.error('Erreur formulaire utilisateur:', error);
      alert(error.response?.data?.message || error.message || 'Erreur lors de l’enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <div className='d-flex justify-content-aligns'>
          <span><BsPersonGear size={28}/></span> 
             <Modal.Title>{user ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}</Modal.Title>
          </div>
        </Modal.Header>

        <Modal.Body>
          {/* EMAIL */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <div className='input-group mb-3'>
            <span className='input-group-text'><BsEnvelope size={28}/></span>
            <Form.Control
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder='exemple@jirama.com'
              style={{fontSize : '18px'}}
            />
            </div>
          </Form.Group>

          {/* MOT DE PASSE */}
          <Form.Group className="mb-3">
            <Form.Label>
              Mot de passe {user && <small>(laisser vide pour ne pas modifier)</small>}
            </Form.Label>
            <div className='input-group mb-3'>
            <span className='input-group-text'><BsShieldLock size={28}/></span>
            <Form.Control
              type="password"
              value={motDePasse}
              minLength={6}
              required={!user}
              onChange={(e) => setMotDePasse(e.target.value)}
              style={{fontSize : '18px'}}
              placeholder='Votre mot de passe...'
            />
            </div>
          </Form.Group>

          {/* RÔLE */}
          <Form.Group className="mb-3">
            <Form.Label>Rôle</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Administrateur</option>
              <option value="medecin">Médecin</option>
              <option value="assistant">Assistant</option>
              <option value="pharmacien">Pharmacien</option>
            </Form.Select>
          </Form.Group>
          
          {role === 'medecin' && (
            <Form.Group className="mb-3">
              <Form.Label>Médecin</Form.Label>
              <Form.Select
                value={idMedecin}
                required
                onChange={(e) => setIdMedecin(e.target.value)}
              >
                <option value="">-- Sélectionner un médecin --</option>
                {medecins.map((m) => (
                  <option key={m.id_medecin} value={m.id_medecin}>
                    {m.nom} — {m.specialite}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* ACTIF */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Compte actif"
              checked={Boolean(actif)} 
              onChange={(e) => setActif(e.target.checked)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : user ? 'Modifier' : 'Créer'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UtilisateurForm;
