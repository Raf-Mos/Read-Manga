const express = require('express');
const { query, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const mangadexService = require('../services/mangadex');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Rate limiting spécifique pour les appels API MangaDex
const mangaLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requêtes par minute
  message: 'Trop de requêtes vers l\'API MangaDex, réessayez dans une minute.'
});

// Validation des erreurs
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Paramètres invalides',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/manga/search - Rechercher des mangas
router.get('/search', mangaLimiter, [
  query('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le titre doit contenir entre 1 et 100 caractères'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être entre 1 et 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'offset doit être un entier positif'),
  query('status')
    .optional()
    .isIn(['ongoing', 'completed', 'hiatus', 'cancelled'])
    .withMessage('Statut invalide')
], handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    console.log('🔍 Nouvelle recherche:', req.query); // ← LOG DE DEBUG AJOUTÉ
    const { title, limit, offset, status, includedTags, excludedTags } = req.query;
    
    const searchParams = {
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    };

    if (title) {
      searchParams.title = title;
    }

    if (status) {
      searchParams.status = [status];
    }

    if (includedTags) {
      searchParams.includedTags = Array.isArray(includedTags) ? includedTags : [includedTags];
    }

    if (excludedTags) {
      searchParams.excludedTags = Array.isArray(excludedTags) ? excludedTags : [excludedTags];
    }

    // Utiliser les langues préférées de l'utilisateur si connecté
    if (req.user?.preferredLanguages) {
      searchParams.availableTranslatedLanguage = req.user.preferredLanguages;
    }

    const result = await mangadexService.searchManga(searchParams);
    res.json(result);

  } catch (error) {
    console.error('Erreur recherche manga:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la recherche' });
  }
});

// GET /api/manga/popular - Obtenir les mangas populaires
router.get('/popular', mangaLimiter, [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être entre 1 et 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'offset doit être un entier positif')
], handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const { limit, offset } = req.query;
    
    const searchParams = {
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    };

    // Utiliser les langues préférées de l'utilisateur si connecté
    if (req.user?.preferredLanguages) {
      searchParams.availableTranslatedLanguage = req.user.preferredLanguages;
    }

    const result = await mangadexService.getPopularManga(searchParams);
    res.json(result);

  } catch (error) {
    console.error('Erreur mangas populaires:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la récupération des mangas populaires' });
  }
});

// GET /api/manga/:id - Obtenir un manga par ID
router.get('/:id', mangaLimiter, [
  param('id')
    .isUUID()
    .withMessage('ID manga invalide')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await mangadexService.getMangaById(id);
    res.json(result);

  } catch (error) {
    console.error('Erreur récupération manga:', error);
    res.status(error.message === 'Manga non trouvé' ? 404 : 500).json({ 
      message: error.message || 'Erreur lors de la récupération du manga' 
    });
  }
});

// GET /api/manga/:id/chapters - Obtenir les chapitres d'un manga
router.get('/:id/chapters', mangaLimiter, [
  param('id')
    .isUUID()
    .withMessage('ID manga invalide'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('La limite doit être entre 1 et 500'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'offset doit être un entier positif'),
  query('languages')
    .optional()
    .custom((value) => {
      const langs = Array.isArray(value) ? value : [value];
      const validLangs = ['en', 'ar', 'fr', 'ja', 'es', 'de'];
      return langs.every(lang => validLangs.includes(lang));
    })
    .withMessage('Langues invalides')
], handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit, offset, languages } = req.query;
    
    const searchParams = {
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    };

    // Utiliser les langues spécifiées ou celles de l'utilisateur
    if (languages) {
      searchParams.languages = Array.isArray(languages) ? languages : [languages];
    } else if (req.user?.preferredLanguages) {
      searchParams.languages = req.user.preferredLanguages;
    }

    const result = await mangadexService.getMangaChapters(id, searchParams);
    res.json(result);

  } catch (error) {
    console.error('Erreur récupération chapitres:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la récupération des chapitres' });
  }
});

// GET /api/manga/chapter/:chapterId/pages - Obtenir les pages d'un chapitre
router.get('/chapter/:chapterId/pages', mangaLimiter, [
  param('chapterId')
    .isUUID()
    .withMessage('ID chapitre invalide')
], handleValidationErrors, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const result = await mangadexService.getChapterPages(chapterId);
    res.json(result);

  } catch (error) {
    console.error('Erreur récupération pages:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la récupération des pages' });
  }
});

// GET /api/manga/debug - Route de debug
router.get('/debug', (req, res) => {
  console.log('🐛 Route de debug appelée à:', new Date().toLocaleTimeString());
  res.json({ 
    message: 'Debug endpoint working!', 
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV 
  });
});

// GET /api/manga/cache/stats - Statistiques du cache (dev uniquement)
router.get('/cache/stats', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Route non trouvée' });
  }

  res.json({
    cacheSize: mangadexService.cache.size,
    cacheTTL: mangadexService.cacheTTL
  });
});

// DELETE /api/manga/cache - Vider le cache (dev uniquement)
router.delete('/cache', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Route non trouvée' });
  }

  mangadexService.clearCache();
  res.json({ message: 'Cache vidé' });
});

module.exports = router;