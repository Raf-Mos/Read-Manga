import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { mangaService } from '../services/manga';
import { Search as SearchIcon, Filter, Grid, List } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    status: '',
    year: '',
    sortBy: 'relevance'
  });

  const currentQuery = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = 20;

  const { data, isLoading, error } = useQuery(
    ['searchManga', currentQuery, page, filters],
    () => mangaService.searchManga({
      title: currentQuery,
      limit,
      offset: (page - 1) * limit,
      status: filters.status || undefined,
      ...filters
    }),
    {
      enabled: !!currentQuery,
      keepPreviousData: true,
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim(), page: '1' });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSearchParams({ q: currentQuery, page: '1' });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ q: currentQuery, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const MangaCard = ({ manga }) => (
    <Link
      to={`/manga/${manga.id}`}
      className={`${viewMode === 'grid' ? 'manga-card' : 'flex bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'} block`}
    >
      {viewMode === 'grid' ? (
        <>
          <div className="aspect-[3/4] relative">
            <img
              src={manga.coverUrl || '/placeholder-manga.jpg'}
              alt={manga.title?.en || manga.title?.ar || 'Manga'}
              className="manga-card-image"
              onError={(e) => e.target.src = '/placeholder-manga.jpg'}
            />
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
              {manga.title?.en || manga.title?.ar || 'Titre non disponible'}
            </h3>
            <p className="text-xs text-gray-500">
              {manga.author}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                {manga.status}
              </span>
              {manga.year && (
                <span className="text-xs text-gray-400">{manga.year}</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-24 sm:w-32 flex-shrink-0">
            <img
              src={manga.coverUrl || '/placeholder-manga.jpg'}
              alt={manga.title?.en || manga.title?.ar || 'Manga'}
              className="w-full h-32 sm:h-40 object-cover rounded-l-lg"
              onError={(e) => e.target.src = '/placeholder-manga.jpg'}
            />
          </div>
          <div className="flex-1 p-4">
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {manga.title?.en || manga.title?.ar || 'Titre non disponible'}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{manga.author}</p>
            <p className="text-sm text-gray-500 line-clamp-3 mb-3">
              {manga.description?.en || manga.description?.ar || 'Aucune description disponible'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                {manga.status}
              </span>
              {manga.year && (
                <span className="text-xs text-gray-400">{manga.year}</span>
              )}
            </div>
          </div>
        </>
      )}
    </Link>
  );

  return (
    <div className="page-container">
      {/* En-tête de recherche */}
      <div className="mb-8">
        <h1 className="section-title">Recherche de mangas</h1>
        
        {/* Formulaire de recherche */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un manga par titre..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
          </div>
        </form>

        {/* Filtres et options d'affichage */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="ongoing">En cours</option>
              <option value="completed">Terminé</option>
              <option value="hiatus">En pause</option>
              <option value="cancelled">Annulé</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="input text-sm"
            >
              <option value="relevance">Pertinence</option>
              <option value="followedCount">Popularité</option>
              <option value="createdAt">Plus récent</option>
              <option value="updatedAt">Dernière mise à jour</option>
            </select>
          </div>

          {/* Basculement mode d'affichage */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      {!currentQuery ? (
        <div className="text-center py-12">
          <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Commencez votre recherche
          </h3>
          <p className="text-gray-500">
            Utilisez la barre de recherche pour trouver vos mangas préférés
          </p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">Recherche en cours...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Erreur lors de la recherche</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Nombre de résultats */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {data?.total || 0} résultat(s) pour "{currentQuery}"
            </p>
          </div>

          {/* Grille/Liste des résultats */}
          {data?.data?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Aucun manga trouvé</p>
              <p className="text-sm text-gray-400">
                Essayez avec d'autres mots-clés ou vérifiez l'orthographe
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'manga-grid' : 'space-y-4'}>
              {data?.data?.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {page} sur {Math.ceil(data.total / limit)}
                </span>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(data.total / limit)}
                  className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;