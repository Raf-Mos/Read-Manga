import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <BookOpen className="h-16 w-16 text-primary-600 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page non trouvée
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Désolé, la page que vous recherchez n'existe pas. 
          Elle a peut-être été déplacée ou supprimée.
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="btn btn-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
          <Link
            to="/search"
            className="btn btn-outline"
          >
            Rechercher des mangas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;