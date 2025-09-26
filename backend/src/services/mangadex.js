const axios = require('axios');

class MangaDexService {
  constructor() {
    this.baseURL = 'https://api.mangadex.org';
    this.cache = new Map();
    this.cacheTTL = parseInt(process.env.CACHE_TTL) || 300; // 5 minutes par défaut
    
    // Instance axios configurée
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // Augmenté à 15 secondes
      headers: {
        'User-Agent': 'Read-Manga-App/1.0.0'
      }
    });
  }

  // Gestion du cache simple en mémoire
  getCacheKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params).sort().reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
    return `${endpoint}_${JSON.stringify(sortedParams)}`;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.cacheTTL * 1000
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clearCache() {
    this.cache.clear();
  }

  // Rechercher des mangas
  async searchManga(params = {}) {
    const cacheKey = this.getCacheKey('search', params);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const searchParams = {
        limit: params.limit || 20,
        offset: params.offset || 0,
        order: { relevance: 'desc' },
        contentRating: ['safe', 'suggestive'],
        includes: ['cover_art', 'author', 'artist'],
        ...params
      };

      const response = await this.client.get('/manga', { params: searchParams });
      const result = this.formatMangaList(response.data);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur recherche manga:', error.message);
      throw new Error('Erreur lors de la recherche de mangas');
    }
  }

  // Obtenir un manga par ID
  async getMangaById(mangaId) {
    const cacheKey = this.getCacheKey('manga', { id: mangaId });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.client.get(`/manga/${mangaId}`, {
        params: {
          includes: ['cover_art', 'author', 'artist']
        }
      });

      const result = this.formatManga(response.data.data);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur récupération manga:', error.message);
      throw new Error('Manga non trouvé');
    }
  }

  // Obtenir les chapitres d'un manga
  async getMangaChapters(mangaId, params = {}) {
    const cacheKey = this.getCacheKey('chapters', { mangaId, ...params });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const searchParams = {
        manga: mangaId,
        limit: params.limit || 100,
        offset: params.offset || 0,
        order: { chapter: 'asc' },
        translatedLanguage: params.languages || ['en', 'ar'],
        includes: ['scanlation_group'],
        ...params
      };

      const response = await this.client.get('/chapter', { params: searchParams });
      const result = this.formatChapterList(response.data);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur récupération chapitres:', error.message);
      throw new Error('Erreur lors de la récupération des chapitres');
    }
  }

  // Obtenir les pages d'un chapitre
  async getChapterPages(chapterId) {
    const cacheKey = this.getCacheKey('pages', { chapterId });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // D'abord, récupérer les infos du serveur
      const atHomeResponse = await this.client.get(`/at-home/server/${chapterId}`);
      const { baseUrl, chapter } = atHomeResponse.data;

      // Construire les URLs des pages
      const pages = chapter.data.map((filename, index) => ({
        page: index + 1,
        url: `${baseUrl}/data/${chapter.hash}/${filename}`,
        filename
      }));

      const result = {
        chapterId,
        pages,
        totalPages: pages.length
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur récupération pages:', error.message);
      throw new Error('Erreur lors de la récupération des pages du chapitre');
    }
  }

  // Obtenir les mangas populaires
  async getPopularManga(params = {}) {
    const cacheKey = this.getCacheKey('popular', params);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const searchParams = {
        limit: params.limit || 20,
        offset: params.offset || 0,
        order: { followedCount: 'desc' },
        contentRating: ['safe', 'suggestive'],
        includes: ['cover_art', 'author', 'artist'],
        hasAvailableChapters: true,
        ...params
      };

      const response = await this.client.get('/manga', { params: searchParams });
      const result = this.formatMangaList(response.data);
      
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Erreur mangas populaires:', error.message);
      
      // Retourner des données vides plutôt que de planter
      const fallbackResult = {
        data: [],
        total: 0,
        offset: params.offset || 0,
        limit: params.limit || 20
      };
      
      // Mettre en cache le fallback pour éviter les appels répétés
      this.setCache(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  // Formatage des données manga
  formatManga(manga) {
    const coverArt = manga.relationships?.find(rel => rel.type === 'cover_art');
    const author = manga.relationships?.find(rel => rel.type === 'author');
    const artist = manga.relationships?.find(rel => rel.type === 'artist');

    return {
      id: manga.id,
      title: manga.attributes.title,
      description: manga.attributes.description,
      status: manga.attributes.status,
      year: manga.attributes.year,
      contentRating: manga.attributes.contentRating,
      tags: manga.attributes.tags?.map(tag => ({
        id: tag.id,
        name: tag.attributes.name
      })) || [],
      coverUrl: coverArt ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes?.fileName}` : null,
      author: author?.attributes?.name,
      artist: artist?.attributes?.name,
      lastChapter: manga.attributes.lastChapter,
      lastVolume: manga.attributes.lastVolume,
      originalLanguage: manga.attributes.originalLanguage,
      availableTranslatedLanguages: manga.attributes.availableTranslatedLanguages || []
    };
  }

  formatMangaList(response) {
    return {
      data: response.data?.map(manga => this.formatManga(manga)) || [],
      total: response.total || 0,
      limit: response.limit || 20,
      offset: response.offset || 0
    };
  }

  // Obtenir les pages d'un chapitre
  async getChapterPages(chapterId) {
    const cacheKey = this.getCacheKey('chapter-pages', { chapterId });
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      // D'abord obtenir les infos du chapitre
      const chapterResponse = await this.client.get(`/chapter/${chapterId}`);
      
      if (!chapterResponse.data.data) {
        throw new Error('Chapitre non trouvé');
      }

      // Ensuite obtenir le serveur de pages
      const pagesResponse = await this.client.get(`/at-home/server/${chapterId}`);
      
      if (!pagesResponse.data.baseUrl) {
        throw new Error('Serveur de pages non disponible');
      }

      const { baseUrl, chapter } = pagesResponse.data;
      const { hash, data: pageFiles } = chapter;

      // Construire les URLs des pages
      const pages = pageFiles.map((filename, index) => ({
        pageNumber: index + 1,
        url: `${baseUrl}/data/${hash}/${filename}`,
        filename
      }));

      const result = {
        chapterId,
        pages,
        totalPages: pages.length,
        hash
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Erreur récupération pages chapitre:', error.message);
      throw new Error('Erreur lors de la récupération des pages du chapitre');
    }
  }

  formatChapterList(response) {
    return {
      data: response.data?.map(chapter => ({
        id: chapter.id,
        title: chapter.attributes.title,
        chapter: chapter.attributes.chapter,
        volume: chapter.attributes.volume,
        translatedLanguage: chapter.attributes.translatedLanguage,
        publishAt: chapter.attributes.publishAt,
        pages: chapter.attributes.pages,
        scanlationGroup: chapter.relationships?.find(rel => rel.type === 'scanlation_group')?.attributes?.name
      })) || [],
      total: response.total || 0,
      limit: response.limit || 100,
      offset: response.offset || 0
    };
  }
}

module.exports = new MangaDexService();