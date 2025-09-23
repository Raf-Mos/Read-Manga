const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mangaId: {
    type: String,
    required: true,
    match: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i // UUID format
  },
  mangaTitle: {
    type: String,
    required: true,
    trim: true
  },
  mangaCoverUrl: {
    type: String,
    trim: true
  },
  mangaStatus: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus', 'cancelled'],
    default: 'ongoing'
  },
  mangaDescription: {
    type: String,
    trim: true
  },
  lastReadChapter: {
    chapterId: {
      type: String,
      match: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    },
    chapterNumber: String,
    readAt: Date
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    languages: {
      type: [String],
      default: ['en', 'ar'],
      enum: ['en', 'ar', 'fr', 'ja', 'es', 'de']
    },
    lastNotificationDate: Date
  },
  // Cache des derniers chapitres disponibles pour les notifications
  latestChapters: [{
    chapterId: String,
    chapterNumber: String,
    language: String,
    publishAt: Date,
    title: String
  }],
  tags: [String], // Tags pour organiser les favoris
  rating: {
    type: Number,
    min: 1,
    max: 10
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index composé pour garantir l'unicité user + manga
favoriteSchema.index({ userId: 1, mangaId: 1 }, { unique: true });

// Index pour les recherches par utilisateur
favoriteSchema.index({ userId: 1, createdAt: -1 });

// Index pour les notifications
favoriteSchema.index({ 
  'notifications.enabled': 1, 
  'notifications.lastNotificationDate': 1 
});

// Méthode pour mettre à jour le dernier chapitre lu
favoriteSchema.methods.updateLastRead = function(chapterId, chapterNumber) {
  this.lastReadChapter = {
    chapterId,
    chapterNumber,
    readAt: new Date()
  };
  return this.save();
};

// Méthode pour ajouter des nouveaux chapitres
favoriteSchema.methods.addLatestChapters = function(chapters) {
  // Garder seulement les 10 derniers chapitres
  const existingIds = this.latestChapters.map(ch => ch.chapterId);
  const newChapters = chapters.filter(ch => !existingIds.includes(ch.chapterId));
  
  this.latestChapters = [...this.latestChapters, ...newChapters]
    .sort((a, b) => new Date(b.publishAt) - new Date(a.publishAt))
    .slice(0, 10);
    
  return this.save();
};

// Méthode pour obtenir les nouveaux chapitres depuis la dernière visite
favoriteSchema.methods.getNewChapters = function() {
  if (!this.lastReadChapter?.readAt) {
    return this.latestChapters;
  }
  
  return this.latestChapters.filter(chapter => 
    new Date(chapter.publishAt) > this.lastReadChapter.readAt
  );
};

// Méthode statique pour obtenir les favoris avec nouveaux chapitres
favoriteSchema.statics.findWithNewChapters = function(userId) {
  return this.find({ userId })
    .populate('userId', 'username preferredLanguages')
    .lean()
    .then(favorites => {
      return favorites.map(favorite => {
        const newChapters = favorite.latestChapters.filter(chapter => {
          if (!favorite.lastReadChapter?.readAt) return true;
          return new Date(chapter.publishAt) > new Date(favorite.lastReadChapter.readAt);
        });
        
        return {
          ...favorite,
          newChaptersCount: newChapters.length,
          newChapters: newChapters.slice(0, 3) // Montrer seulement les 3 plus récents
        };
      });
    });
};

module.exports = mongoose.model('Favorite', favoriteSchema);