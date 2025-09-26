import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { mangaService } from '../services/manga';
import { ArrowLeft, ArrowRight, Home, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Reader = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [showControls, setShowControls] = useState(true);

  const { data: chapterPages, isLoading, error, refetch } = useQuery(
    ['chapterPages', chapterId],
    () => mangaService.getChapterPages(chapterId),
    { 
      enabled: !!chapterId,
      retry: 3,
      retryDelay: 1000
    }
  );

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextPage();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentPage(1);
          break;
        case 'End':
          e.preventDefault();
          if (chapterPages?.totalPages) {
            setCurrentPage(chapterPages.totalPages);
          }
          break;
        case 'Escape':
          e.preventDefault();
          navigate(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, chapterPages, navigate]);

  const goToNextPage = () => {
    if (chapterPages && currentPage < chapterPages.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  if (isLoading) {
    return (
      <div className="manga-reader flex items-center justify-center">
        <div className="text-center text-white">
          <LoadingSpinner size="lg" />
          <p className="mt-4">Chargement du chapitre...</p>
        </div>
      </div>
    );
  }

  if (error || !chapterPages) {
    return (
      <div className="manga-reader flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Erreur de chargement</h2>
          <p className="mb-6">Impossible de charger les pages du chapitre</p>
          <p className="text-sm text-gray-300 mb-6">
            {error?.message || 'Erreur inconnue'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => refetch()}
              className="btn bg-blue-600 text-white hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réessayer
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn bg-white text-black hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPageData = chapterPages.pages[currentPage - 1];

  return (
    <div 
      className="manga-reader relative"
      onMouseMove={handleMouseMove}
    >
      {/* Page d'image */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {currentPageData ? (
          <img
            src={currentPageData.url}
            alt={`Page ${currentPage}`}
            className="manga-page"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center'
            }}
            onError={(e) => {
              console.log('Erreur chargement image:', currentPageData.url);
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk3YTNiNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
            }}
            onClick={goToNextPage}
          />
        ) : (
          <div className="flex items-center justify-center h-96 text-white">
            <div className="text-center">
              <p className="text-lg mb-2">Page non disponible</p>
              <p className="text-sm text-gray-300">Page {currentPage} introuvable</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation par zones cliquables */}
      <div className="absolute inset-0 flex">
        {/* Zone précédente (gauche) */}
        <div 
          className="w-1/3 h-full cursor-pointer"
          onClick={goToPreviousPage}
          title="Page précédente"
        />
        {/* Zone suivante (droite) */}
        <div 
          className="w-2/3 h-full cursor-pointer"
          onClick={goToNextPage}
          title="Page suivante"
        />
      </div>

      {/* Contrôles */}
      {showControls && (
        <>
          {/* Header */}
          <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white p-4 z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Retour"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Accueil"
                >
                  <Home className="h-5 w-5" />
                </button>
              </div>
              
              <div className="text-center">
                <p className="font-medium">
                  Page {currentPage} sur {chapterPages.totalPages}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Zoom arrière"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-sm">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Zoom avant"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Réinitialiser zoom"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="reader-controls">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Page précédente (←)"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max={chapterPages.totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm whitespace-nowrap">
                {currentPage} / {chapterPages.totalPages}
              </span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === chapterPages.totalPages}
              className="p-2 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Page suivante (→)"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </>
      )}

      {/* Instructions */}
      {showControls && currentPage === 1 && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg text-sm z-40">
          <p>💡 Utilisez les flèches du clavier ou cliquez sur l'image pour naviguer</p>
        </div>
      )}
    </div>
  );
};

export default Reader;