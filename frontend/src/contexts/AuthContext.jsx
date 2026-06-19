import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { utilisateurService } from '../services/utilisateurService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        return;
      }

      const response = await utilisateurService.getProfile();
      
      if (response?.success && response?.data?.id) {
        
        setUser(response.data);
        localStorage.setItem('userData', JSON.stringify(response.data));
      } else {
        console.warn('Token invalide ou expiré');
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      console.error(' Erreur vérification auth:', error.message);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await utilisateurService.login({ 
        email, 
        mot_de_passe: password 
      });
      
      if (response?.success && response?.data?.token && response?.data?.user) {
        const { token, user: userData } = response.data;
        setUser(userData);
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        return { 
          success: false, 
          message: response?.message || 'Échec de la connexion' 
        };
      }
    } catch (err) {
      console.error('Erreur login:', err);
      return { 
        success: false, 
        message: err.message || 'Erreur de connexion au serveur' 
      };
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
      setLoading(false);
    };
    initializeAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout: async () => {
          try {
            await utilisateurService.logout();
          } catch (err) {
            console.error('Erreur logout:', err);
          } finally {
            setUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        },
        isAuthenticated: !!user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};