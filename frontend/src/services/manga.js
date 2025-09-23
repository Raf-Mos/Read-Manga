import api from './api';

export const mangaService = {
  // Rechercher des mangas
  searchManga: async (params = {}) => {
    const response = await api.get('/manga/search', { params });
    return response.data;
  },

  // Obtenir les mangas populaires
  getPopularManga: async (params = {}) => {
    const response = await api.get('/manga/popular', { params });
    return response.data;
  },

  // Obtenir un manga par ID
  getMangaById: async (mangaId) => {
    const response = await api.get(`/manga/${mangaId}`);
    return response.data;
  },

  // Obtenir les chapitres d'un manga
  getMangaChapters: async (mangaId, params = {}) => {
    const response = await api.get(`/manga/${mangaId}/chapters`, { params });
    return response.data;
  },

  // Obtenir les pages d'un chapitre
  getChapterPages: async (chapterId) => {
    const response = await api.get(`/manga/chapter/${chapterId}/pages`);
    return response.data;
  },

  // Statistiques du cache (dev uniquement)
  getCacheStats: async () => {
    const response = await api.get('/manga/cache/stats');
    return response.data;
  },

  // Vider le cache (dev uniquement)
  clearCache: async () => {
    const response = await api.delete('/manga/cache');
    return response.data;
  }
};