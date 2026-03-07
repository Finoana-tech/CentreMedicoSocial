// Rôles utilisateurs
export const USER_ROLES = {
  ADMIN: 'admin',
  MEDECIN: 'medecin',
  ASSISTANT: 'assistant',
  PHARMACIEN: 'pharmacien'
};

// Statuts des rendez-vous
export const RENDEZ_VOUS_STATUS = {
  PLANIFIE: 'Planifié',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé'
};

// Sexes des patients
export const PATIENT_SEXE = {
  M: 'M',
  F: 'F'
};

// Liens familiaux
export const LIENS_FAMILIAUX = {
  CONJOINT: 'Conjoint',
  ENFANT: 'Enfant'
};

// Routes accessibles par rôle
export const ROLE_ROUTES = {
  admin: ['/dashboard', '/patients', '/medecins', '/rendezvous', '/ordonnances', '/medicaments', '/profile'],
  medecin: ['/dashboard', '/patients', '/rendezvous', '/ordonnances', '/profile'],
  secretaire: ['/dashboard', '/patients', '/rendezvous', '/profile'],
  pharmacien: ['/dashboard', '/medicaments', '/ordonnances', '/profile']
};

// Couleurs du thème médical
export const MEDICAL_COLORS = {
  primary: '#3498db',
  secondary: '#2c3e50',
  success: '#27ae60',
  danger: '#e74c3c',
  warning: '#f39c12',
  info: '#17a2b8'
};