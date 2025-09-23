import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { favoritesService } from '../services/favorites';
import { Heart, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Favorites = () => {
  const { data: favorites, isLoading, error } = useQuery(
    'favorites',
    () => favoritesService.getFavorites({ limit: 50 }),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const { data: stats } = useQuery(
    'favoritesStats',
    () => favoritesService.getFavoritesStats(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h2>
        <p className="text-gray-600 mb-6">Impossible de charger vos favoris</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title">Mes favoris</h1>
        
        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgRating || '-'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byStatus?.ongoing || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Terminés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.byStatus?.completed || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des favoris */}
      {!favorites || favorites.data?.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun favori pour le moment
          </h3>
          <p className="text-gray-500 mb-6">
            Découvrez et ajoutez vos mangas préférés à votre collection
          </p>
          <Link to="/search" className="btn btn-primary">
            Découvrir des mangas
          </Link>
        </div>
      ) : (
        <div className="manga-grid">
          {favorites.data.map((favorite) => (
            <Link
              key={favorite.mangaId}
              to={`/manga/${favorite.mangaId}`}
              className="manga-card block relative"
            >
              {/* Badge nouveaux chapitres */}
              {favorite.hasNewChapters && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
                  Nouveau
                </div>
              )}
              
              <div className="aspect-[3/4] relative">
                <img
                  src={favorite.mangaCoverUrl || '/placeholder-manga.jpg'}
                  alt={favorite.mangaTitle}
                  className="manga-card-image"
                  onError={(e) => e.target.src = '/placeholder-manga.jpg'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">
                    {favorite.mangaTitle}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize">{favorite.mangaStatus}</span>
                    {favorite.rating && (
                      <div className="flex items-center">
                        <span>⭐ {favorite.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                  {favorite.mangaTitle}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{favorite.mangaStatus}</span>
                  {favorite.newChaptersCount > 0 && (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      +{favorite.newChaptersCount}
                    </span>
                  )}
                </div>
                
                {/* Dernier chapitre lu */}
                {favorite.lastReadChapter && (
                  <p className="text-xs text-gray-400 mt-1">
                    Lu: Ch. {favorite.lastReadChapter.chapterNumber}
                  </p>
                )}
                
                {/* Date d'ajout */}
                <p className="text-xs text-gray-400 mt-1">
                  Ajouté: {new Date(favorite.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;