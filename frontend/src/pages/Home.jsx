import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { mangaService } from '../services/manga';
import { BookOpen, TrendingUp, Search, Star } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { data: popularManga, isLoading, error } = useQuery(
    'popularManga',
    () => mangaService.getPopularManga({ limit: 12 }),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const MangaCard = ({ manga }) => (
    <Link
      to={`/manga/${manga.id}`}
      className="manga-card block"
    >
      <div className="aspect-[3/4] relative">
        <img
          src={manga.coverUrl || '/placeholder-manga.jpg'}
          alt={manga.title?.en || manga.title?.ar || 'Manga'}
          className="manga-card-image"
          onError={(e) => {
            e.target.src = '/placeholder-manga.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-gray-100 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-medium text-sm mb-1 line-clamp-2 text-blue-400">
            {manga.title?.en || manga.title?.ar || 'Titre non disponible'}
          </h3>
          <p className="text-xs text-gray-300 mb-1">
            {manga.author && <span>{manga.author}</span>}
          </p>
          <p className="text-xs text-gray-300">
            {manga.status && (
              <span className="capitalize">{manga.status}</span>
            )}
            {manga.year && (
              <span> • {manga.year}</span>
            )}
          </p>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
          {manga.title?.en || manga.title?.ar || 'Titre non disponible'}
        </h3>
        <div className="space-y-1">
          {manga.author && (
            <p className="text-xs text-gray-600 font-medium">
              {manga.author}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {manga.status && (
              <span className="capitalize">{manga.status}</span>
            )}
            {manga.year && (
              <span> • {manga.year}</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl text-white p-8 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Découvrez l'univers
            <span className="block text-primary-200">du manga</span>
          </h1>
          <p className="text-xl text-primary-100 mb-8">
            Explorez des milliers de mangas, suivez vos favoris et 
            découvrez de nouvelles histoires passionnantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/search"
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg inline-flex items-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Commencer à explorer
            </Link>
            <Link
              to="/register"
              className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Milliers de mangas</h3>
              <p className="text-sm text-gray-600">Bibliothèque complète</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Mises à jour quotidiennes</h3>
              <p className="text-sm text-gray-600">Nouveaux chapitres</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Favoris & Suivi</h3>
              <p className="text-sm text-gray-600">Gérez votre collection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mangas populaires */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Mangas populaires</h2>
          <Link
            to="/search"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Voir tous
          </Link>
        </div>

        {isLoading ? (
          <div className="manga-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-300 rounded-lg mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Erreur lors du chargement des mangas populaires
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="manga-grid">
            {popularManga?.data?.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>

      {/* Call to action */}
      <div className="bg-gray-100 rounded-xl p-8 mt-16 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Prêt à commencer votre aventure manga ?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Rejoignez notre communauté et découvrez votre prochain manga favori. 
          Créez votre compte gratuitement et commencez à explorer dès maintenant.
        </p>
        <Link
          to="/register"
          className="btn btn-primary btn-lg"
        >
          Créer un compte gratuit
        </Link>
      </div>
    </div>
  );
};

export default Home;