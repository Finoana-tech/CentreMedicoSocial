import { useState, useCallback } from 'react';

export const useForm = (initialState = {}, validateFn = null) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mise à jour des champs du formulaire
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Marquer le champ comme touché
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Effacer l'erreur du champ quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Gestion des champs select, radio, etc.
  const setFieldValue = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Validation du formulaire
  const validateForm = useCallback(() => {
    if (validateFn) {
      const newErrors = validateFn(formData);
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  }, [formData, validateFn]);

  // Réinitialisation du formulaire
  const resetForm = useCallback((newState = initialState) => {
    setFormData(newState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialState]);

  // Soumission du formulaire
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    
    // Validation
    const isValid = validateForm();
    
    if (isValid) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  // Vérifier si un champ est en erreur et a été touché
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : '';
  }, [errors, touched]);

  // Vérifier si le formulaire est valide
  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    setFieldValue,
    handleSubmit,
    resetForm,
    validateForm,
    getFieldError,
    setFormData, // Pour les mises à jour manuelles
    setErrors,   // Pour définir des erreurs manuellement
  };
};

// Validateurs prédéfinis
export const validators = {
  required: (value) => !value || value.toString().trim() === '' ? 'Ce champ est requis' : '',
  email: (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Email invalide' : '';
  },
  minLength: (min) => (value) => {
    if (!value) return '';
    return value.length < min ? `Doit contenir au moins ${min} caractères` : '';
  },
  maxLength: (max) => (value) => {
    if (!value) return '';
    return value.length > max ? `Ne doit pas dépasser ${max} caractères` : '';
  },
  phone: (value) => {
    if (!value) return '';
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    return !phoneRegex.test(value.replace(/\s/g, '')) ? 'Numéro de téléphone invalide' : '';
  },
  date: (value) => {
    if (!value) return '';
    const date = new Date(value);
    return isNaN(date.getTime()) ? 'Date invalide' : '';
  },
  number: (value) => {
    if (!value) return '';
    return isNaN(value) ? 'Doit être un nombre' : '';
  }
};

// Helper pour créer des schémas de validation
export const createValidator = (rules) => (data) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    const value = data[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return errors;
};