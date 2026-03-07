import { RENDEZ_VOUS_STATUS, PATIENT_SEXE } from './constants';

/**
 * Format une date au format français
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

/**
 * Format une date et heure au format français
 */
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  return new Date(dateTimeString).toLocaleString('fr-FR');
};

/**
 * Retourne la classe Bootstrap pour le statut d'un rendez-vous
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case RENDEZ_VOUS_STATUS.PLANIFIE:
      return 'bg-warning text-dark';
    case RENDEZ_VOUS_STATUS.TERMINE:
      return 'bg-success';
    case RENDEZ_VOUS_STATUS.ANNULE:
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

/**
 * Retourne le libellé du sexe
 */
export const getSexeLabel = (sexe) => {
  return sexe === PATIENT_SEXE.M ? 'Masculin' : 'Féminin';
};

/**
 * Fonction de debounce pour les recherches
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Calcule l'âge à partir de la date de naissance
 */
export const calculateAge = (dateNaissance) => {
  if (!dateNaissance) return null;
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Valide un email
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Valide un numéro de téléphone
 */
export const validatePhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  return re.test(phone.replace(/\s/g, ''));
};