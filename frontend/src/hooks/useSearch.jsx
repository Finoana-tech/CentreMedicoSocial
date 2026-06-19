import { useState, useMemo, useCallback, useEffect } from 'react';

export const useSearch = (data = [], searchFields = [], options = {}) => {
  const {
    debounceDelay = 300,
    caseSensitive = false,
    initialQuery = '',
    filterFn = null
  } = options;

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState(null);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceDelay]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (debouncedQuery.trim() && searchFields.length > 0) {
      const query = caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase();
      
      result = result.filter(item =>
        searchFields.some(field => {
          const fieldValue = item[field];
          if (!fieldValue) return false;
          
          const value = caseSensitive ? fieldValue.toString() : fieldValue.toString().toLowerCase();
          return value.includes(query);
        })
      );
    }

    if (filters && Object.keys(filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filters).every(([field, filterValue]) => {
          if (filterValue === null || filterValue === '' || filterValue === undefined) {
            return true;
          }
          
          const itemValue = item[field];
          
          if (typeof filterValue === 'string' || typeof filterValue === 'number') {
            return itemValue == filterValue;
          }
          
          if (typeof filterValue === 'function') {
            return filterValue(itemValue);
          }
          
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue);
          }
          
          return true;
        });
      });
    }

    if (filterFn) {
      result = result.filter(filterFn);
    }

    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, debouncedQuery, searchFields, filters, sortConfig, caseSensitive, filterFn]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  const setFilter = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const clearFilter = useCallback((field) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);


  const handleSort = useCallback((key) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    filters,
    sortConfig,
    
    filteredData,
    resultsCount: filteredData.length,
    totalCount: data.length,
    
    handleSearch,
    clearSearch,
    
    setFilter,
    clearFilter,
    clearAllFilters,
    
    handleSort,
    clearSort,
    
    hasSearch: !!debouncedQuery.trim(),
    hasFilters: Object.keys(filters).length > 0,
    hasSort: !!sortConfig,
    isEmpty: filteredData.length === 0
  };
};

// Hook spécialisé pour la recherche de patients
export const usePatientSearch = (patients = []) => {
  const searchFields = ['nom', 'prenom', 'telephone', 'email'];
  
  const search = useSearch(patients, searchFields, {
    debounceDelay: 300,
    caseSensitive: false
  });

  // Filtres spécifiques aux patients
  const setSexeFilter = (sexe) => {
    if (sexe === '') {
      search.clearFilter('sexe');
    } else {
      search.setFilter('sexe', sexe);
    }
  };

  const setHasTelephoneFilter = (hasPhone) => {
    if (hasPhone === null) {
      search.clearFilter('telephone');
    } else if (hasPhone) {
      search.setFilter('telephone', value => value && value.trim() !== '');
    } else {
      search.setFilter('telephone', value => !value || value.trim() === '');
    }
  };

  return {
    ...search,
    setSexeFilter,
    setHasTelephoneFilter
  };
};