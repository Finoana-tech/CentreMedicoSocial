import { RENDEZ_VOUS_STATUS, PATIENT_SEXE } from './constants';

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-';
  return new Date(dateTimeString).toLocaleString('fr-FR');
};

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

export const getSexeLabel = (sexe) => {
  return sexe === PATIENT_SEXE.M ? 'Masculin' : 'Féminin';
};

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

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  return re.test(phone.replace(/\s/g, ''));
};