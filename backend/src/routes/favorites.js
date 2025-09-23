const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Favorite = require('../models/Favorite');
const { authenticateToken } = require('../middleware/auth');
const mangadexService = require('../services/mangadex');

const router = express.Router();

// Validation des erreurs
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Données invalides',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/favorites - Obtenir tous les favoris de l'utilisateur
router.get('/', authenticateToken, [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'offset doit être un entier positif'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'mangaTitle', 'lastReadChapter', 'rating'])
    .withMessage('Tri invalide'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordre invalide')
], handleValidationErrors, async (req, res) => {
  try {
    const { limit = 20, offset = 0, sortBy = 'createdAt', order = 'desc', search, tags } = req.query;
    
    const filter = { userId: req.user._id };
    
    // Recherche par titre
    if (search) {
      filter.mangaTitle = { $regex: search, $options: 'i' };
    }
    
    // Filtrage par tags
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagList };
    }
    
    const sortObj = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;
    
    const favorites = await Favorite.find(filter)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();
    
    const total = await Favorite.countDocuments(filter);
    
    // Ajouter les informations sur les nouveaux chapitres
    const favoritesWithNew = favorites.map(favorite => {
      const newChapters = favorite.latestChapters.filter(chapter => {
        if (!favorite.lastReadChapter?.readAt) return true;
        return new Date(chapter.publishAt) > new Date(favorite.lastReadChapter.readAt);
      });
      
      return {
        ...favorite,
        newChaptersCount: newChapters.length,
        hasNewChapters: newChapters.length > 0
      };
    });
    
    res.json({
      data: favoritesWithNew,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des favoris' });
  }
});

// POST /api/favorites - Ajouter un manga aux favoris
router.post('/', authenticateToken, [
  body('mangaId')
    .isUUID()
    .withMessage('ID manga invalide'),
  body('mangaTitle')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Titre manga requis (1-200 caractères)'),
  body('mangaCoverUrl')
    .optional()
    .isURL()
    .withMessage('URL de couverture invalide'),
  body('mangaStatus')
    .optional()
    .isIn(['ongoing', 'completed', 'hiatus', 'cancelled'])
    .withMessage('Statut manga invalide'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('La note doit être entre 1 et 10'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères')
], handleValidationErrors, async (req, res) => {
  try {
    const { 
      mangaId, 
      mangaTitle, 
      mangaCoverUrl, 
      mangaStatus, 
      mangaDescription,
      tags, 
      rating, 
      notes 
    } = req.body;
    
    // Vérifier si déjà en favoris
    const existingFavorite = await Favorite.findOne({ 
      userId: req.user._id, 
      mangaId 
    });
    
    if (existingFavorite) {
      return res.status(400).json({ message: 'Ce manga est déjà dans vos favoris' });
    }
    
    // Récupérer les derniers chapitres du manga
    let latestChapters = [];
    try {
      const chaptersResponse = await mangadexService.getMangaChapters(mangaId, {
        limit: 10,
        languages: req.user.preferredLanguages
      });
      
      latestChapters = chaptersResponse.data.map(chapter => ({
        chapterId: chapter.id,
        chapterNumber: chapter.chapter,
        language: chapter.translatedLanguage,
        publishAt: new Date(chapter.publishAt),
        title: chapter.title
      }));
    } catch (error) {
      console.log('Impossible de récupérer les chapitres:', error.message);
    }
    
    const favorite = new Favorite({
      userId: req.user._id,
      mangaId,
      mangaTitle,
      mangaCoverUrl,
      mangaStatus,
      mangaDescription,
      tags: tags || [],
      rating,
      notes,
      latestChapters,
      notifications: {
        enabled: true,
        languages: req.user.preferredLanguages
      }
    });
    
    await favorite.save();
    
    res.status(201).json({
      message: 'Manga ajouté aux favoris',
      favorite
    });

  } catch (error) {
    console.error('Erreur ajout favori:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ce manga est déjà dans vos favoris' });
    }
    res.status(500).json({ message: 'Erreur lors de l\'ajout aux favoris' });
  }
});

// GET /api/favorites/:mangaId - Vérifier si un manga est en favori
router.get('/check/:mangaId', authenticateToken, [
  param('mangaId')
    .isUUID()
    .withMessage('ID manga invalide')
], handleValidationErrors, async (req, res) => {
  try {
    const { mangaId } = req.params;
    
    const favorite = await Favorite.findOne({ 
      userId: req.user._id, 
      mangaId 
    });
    
    res.json({
      isFavorite: !!favorite,
      favorite: favorite || null
    });

  } catch (error) {
    console.error('Erreur vérification favori:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification' });
  }
});

// PUT /api/favorites/:mangaId - Mettre à jour un favori
router.put('/:mangaId', authenticateToken, [
  param('mangaId')
    .isUUID()
    .withMessage('ID manga invalide'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('La note doit être entre 1 et 10'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères'),
  body('notifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('Les notifications doivent être boolean'),
  body('notifications.languages')
    .optional()
    .isArray()
    .custom((languages) => {
      const validLanguages = ['en', 'ar', 'fr', 'ja', 'es', 'de'];
      return languages.every(lang => validLanguages.includes(lang));
    })
], handleValidationErrors, async (req, res) => {
  try {
    const { mangaId } = req.params;
    const updates = req.body;
    
    const favorite = await Favorite.findOne({ 
      userId: req.user._id, 
      mangaId 
    });
    
    if (!favorite) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }
    
    // Mise à jour des champs
    Object.keys(updates).forEach(key => {
      if (key === 'notifications' && updates.notifications) {
        favorite.notifications = { ...favorite.notifications, ...updates.notifications };
      } else {
        favorite[key] = updates[key];
      }
    });
    
    await favorite.save();
    
    res.json({
      message: 'Favori mis à jour',
      favorite
    });

  } catch (error) {
    console.error('Erreur mise à jour favori:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// POST /api/favorites/:mangaId/read - Marquer un chapitre comme lu
router.post('/:mangaId/read', authenticateToken, [
  param('mangaId')
    .isUUID()
    .withMessage('ID manga invalide'),
  body('chapterId')
    .isUUID()
    .withMessage('ID chapitre invalide'),
  body('chapterNumber')
    .notEmpty()
    .withMessage('Numéro de chapitre requis')
], handleValidationErrors, async (req, res) => {
  try {
    const { mangaId } = req.params;
    const { chapterId, chapterNumber } = req.body;
    
    const favorite = await Favorite.findOne({ 
      userId: req.user._id, 
      mangaId 
    });
    
    if (!favorite) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }
    
    await favorite.updateLastRead(chapterId, chapterNumber);
    
    res.json({
      message: 'Chapitre marqué comme lu',
      lastRead: favorite.lastReadChapter
    });

  } catch (error) {
    console.error('Erreur marquage lecture:', error);
    res.status(500).json({ message: 'Erreur lors du marquage de lecture' });
  }
});

// DELETE /api/favorites/:mangaId - Supprimer un favori
router.delete('/:mangaId', authenticateToken, [
  param('mangaId')
    .isUUID()
    .withMessage('ID manga invalide')
], handleValidationErrors, async (req, res) => {
  try {
    const { mangaId } = req.params;
    
    const favorite = await Favorite.findOneAndDelete({ 
      userId: req.user._id, 
      mangaId 
    });
    
    if (!favorite) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }
    
    res.json({ message: 'Manga retiré des favoris' });

  } catch (error) {
    console.error('Erreur suppression favori:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

// GET /api/favorites/stats - Statistiques des favoris
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Favorite.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          statusCounts: {
            $push: '$mangaStatus'
          },
          tagsCount: {
            $push: '$tags'
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        total: 0,
        avgRating: 0,
        byStatus: {},
        topTags: []
      });
    }
    
    const result = stats[0];
    
    // Compter par statut
    const statusCounts = {};
    result.statusCounts.forEach(status => {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Compter les tags les plus utilisés
    const allTags = result.tagsCount.flat();
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    
    res.json({
      total: result.total,
      avgRating: Math.round((result.avgRating || 0) * 10) / 10,
      byStatus: statusCounts,
      topTags
    });

  } catch (error) {
    console.error('Erreur statistiques favoris:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

module.exports = router;