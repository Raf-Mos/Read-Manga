import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { mangaService } from '../services/manga';
import { favoritesService } from '../services/favorites';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Heart, BookOpen, Calendar, User, Star } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const MangaDetail = () => {
  const { mangaId } = useParams();
  const { isAuthenticated } = useAuth();

  const { data: manga, isLoading: mangaLoading } = useQuery(
    ['manga', mangaId],
    () => mangaService.getMangaById(mangaId),
    { enabled: !!mangaId }
  );

  const { data: chapters, isLoading: chaptersLoading } = useQuery(
    ['mangaChapters', mangaId],
    () => mangaService.getMangaChapters(mangaId, { limit: 50 }),
    { enabled: !!mangaId }
  );

  const { data: favoriteStatus } = useQuery(
    ['favoriteCheck', mangaId],
    () => favoritesService.checkFavorite(mangaId),
    { enabled: !!mangaId && isAuthenticated }
  );

  if (mangaLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manga non trouvé</h2>
        <Link to="/search" className="btn btn-primary">
          Retour à la recherche
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          to="/search"
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la recherche
        </Link>
      </div>

      {/* En-tête du manga */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={manga.coverUrl || '/placeholder-manga.jpg'}
              alt={manga.title?.en || manga.title?.ar || 'Manga'}
              className="w-48 h-64 object-cover rounded-lg shadow-md"
              onError={(e) => e.target.src = '/placeholder-manga.jpg'}
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {manga.title?.en || manga.title?.ar || 'Titre non disponible'}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                manga.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                manga.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {manga.status}
              </span>
              {manga.year && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{manga.year}</span>
                </div>
              )}
              {manga.author && (
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  <span>{manga.author}</span>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              {manga.description?.en || manga.description?.ar || 'Aucune description disponible.'}
            </p>

            <div className="flex gap-3">
              {isAuthenticated && (
                <button
                  className={`btn ${favoriteStatus?.isFavorite ? 'btn-secondary' : 'btn-primary'} flex items-center`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${favoriteStatus?.isFavorite ? 'fill-current' : ''}`} />
                  {favoriteStatus?.isFavorite ? 'En favori' : 'Ajouter aux favoris'}
                </button>
              )}
              
              <Link
                to={`/reader/${chapters?.data?.[0]?.id}`}
                className="btn btn-outline flex items-center"
                disabled={!chapters?.data?.length}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Commencer la lecture
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des chapitres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Chapitres</h2>
        </div>
        
        <div className="p-6">
          {chaptersLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="mt-2 text-gray-500">Chargement des chapitres...</p>
            </div>
          ) : chapters?.data?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun chapitre disponible</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chapters?.data?.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/reader/${chapter.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {chapter.title || `Chapitre ${chapter.chapter}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {chapter.scanlationGroup && (
                        <span>{chapter.scanlationGroup} • </span>
                      )}
                      {chapter.translatedLanguage?.toUpperCase()}
                      {chapter.pages && (
                        <span> • {chapter.pages} pages</span>
                      )}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(chapter.publishAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;