import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">Read Manga</span>
            </Link>
            <p className="text-sm text-gray-600">
              Votre plateforme de lecture de mangas préférée. 
              Découvrez et lisez des milliers de mangas gratuitement.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-sm text-gray-600 hover:text-primary-600">
                  Recherche
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-sm text-gray-600 hover:text-primary-600">
                  Mes favoris
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-gray-600 hover:text-primary-600">
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">À propos</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <Heart className="h-4 w-4 mr-2 text-red-500" />
                Propulsé par MangaDex API
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <Github className="h-4 w-4 mr-2" />
                Open Source
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Read Manga. Tous droits réservés.
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            Les mangas appartiennent à leurs auteurs respectifs. 
            Cette application est uniquement à des fins éducatives.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;