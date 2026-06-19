import { useState, useEffect } from 'react';

export const useCrud = (service, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const fetchAll = async () => {
  try {
    setLoading(true);
    setError('');
    const result = await service.getAll();
    setData(Array.isArray(result) ? result : []); 
    setSearchResults(null);
  } catch (err) {
    setError('Erreur lors du chargement des données');
    console.error('Error fetching data:', err);
  } finally {
    setLoading(false);
  }
};


  const fetchStats = async () => {
    try {
      const result = await service.getStats();
      setStats(result);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const search = async (searchTerm, filters = {}) => {
    try {
      setLoading(true);
      setError('');
      const result = await service.search(searchTerm, filters);
      setSearchResults(result);
      return result;
    } catch (err) {
      setError('Erreur lors de la recherche');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const create = async (itemData) => {
    try {
      const result = await service.create(itemData);
      await fetchAll(); 
      return result;
    } catch (err) {
      setError('Erreur lors de la création');
      throw err;
    }
  };

  const update = async (id, itemData) => {
    try {
      const result = await service.update(id, itemData);
      await fetchAll(); 
      return result;
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      throw err;
    }
  };

  const remove = async (id) => {
    try {
      await service.delete(id);
      await fetchAll(); 
    } catch (err) {
      setError('Erreur lors de la suppression');
      throw err;
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
  };

  useEffect(() => {
    fetchAll();
    if (options.autoFetchStats) {
      fetchStats();
    }
  }, []);

  return {
    // Données
    data: searchResults || data,
    originalData: data,
    searchResults,
    stats,
    
    // États
    loading,
    error,
    
    // Actions CRUD
    fetchAll,
    create,
    update,
    remove,
    
    // Actions recherche
    search,
    clearSearch,
    
    // Actions statistiques
    fetchStats,
    
    // États dérivés
    isSearching: searchResults !== null,
    isEmpty: (searchResults || data).length === 0
  };
};