import api from './api';

export const favoritesService = {
  // Obtenir tous les favoris
  getFavorites: async (params = {}) => {
    const response = await api.get('/favorites', { params });
    return response.data;
  },

  // Ajouter un manga aux favoris
  addFavorite: async (mangaData) => {
    const response = await api.post('/favorites', mangaData);
    return response.data;
  },

  // Vérifier si un manga est en favori
  checkFavorite: async (mangaId) => {
    const response = await api.get(`/favorites/check/${mangaId}`);
    return response.data;
  },

  // Mettre à jour un favori
  updateFavorite: async (mangaId, updateData) => {
    const response = await api.put(`/favorites/${mangaId}`, updateData);
    return response.data;
  },

  // Marquer un chapitre comme lu
  markChapterRead: async (mangaId, chapterData) => {
    const response = await api.post(`/favorites/${mangaId}/read`, chapterData);
    return response.data;
  },

  // Supprimer un favori
  removeFavorite: async (mangaId) => {
    const response = await api.delete(`/favorites/${mangaId}`);
    return response.data;
  },

  // Obtenir les statistiques des favoris
  getFavoritesStats: async () => {
    const response = await api.get('/favorites/stats');
    return response.data;
  }
};