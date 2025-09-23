import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();

      if (token && savedUser) {
        // Vérifier la validité du token
        try {
          const response = await authService.verifyToken();
          setUser(response.user);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalide, nettoyer les données
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur initialisation auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success(`Bienvenue ${response.user.username}!`);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      toast.success(`Inscription réussie! Bienvenue ${response.user.username}!`);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur d\'inscription';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Déconnexion réussie');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      setUser(response.user);
      toast.success('Profil mis à jour');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de mise à jour';
      toast.error(message);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Erreur refresh user:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};