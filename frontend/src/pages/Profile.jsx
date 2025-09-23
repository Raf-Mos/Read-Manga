import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { User, Edit3, Save, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      preferredLanguages: user?.preferredLanguages || ['en', 'ar']
    }
  });

  const watchedLanguages = watch('preferredLanguages', []);

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
    }
  };

  const handleCancel = () => {
    reset({
      username: user?.username || '',
      preferredLanguages: user?.preferredLanguages || ['en', 'ar']
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="lg" className="py-20" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary-100 rounded-full p-3">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">Mon profil</h1>
                <p className="text-sm text-gray-600">Gérez vos informations personnelles</p>
              </div>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm flex items-center"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="btn btn-ghost btn-sm flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm flex items-center"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations de base */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom d'utilisateur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        {...register('username', {
                          required: 'Le nom d\'utilisateur est requis',
                          minLength: {
                            value: 3,
                            message: 'Au moins 3 caractères requis'
                          },
                          maxLength: {
                            value: 30,
                            message: 'Maximum 30 caractères'
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9_-]+$/,
                            message: 'Seuls les lettres, chiffres, _ et - sont autorisés'
                          }
                        })}
                        className="input"
                        placeholder="Votre nom d'utilisateur"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                      )}
                    </div>
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {user?.username}
                    </p>
                  )}
                </div>

                {/* Email (non modifiable) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="p-3 bg-gray-50 rounded-lg text-gray-600">
                    {user?.email}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    L'email ne peut pas être modifié
                  </p>
                </div>
              </div>
            </div>

            {/* Préférences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Préférences de lecture
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Langues préférées
                </label>
                
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'en', label: 'Anglais' },
                      { value: 'ar', label: 'Arabe' },
                      { value: 'fr', label: 'Français' },
                      { value: 'ja', label: 'Japonais' },
                      { value: 'es', label: 'Espagnol' },
                      { value: 'de', label: 'Allemand' }
                    ].map((lang) => (
                      <label key={lang.value} className="flex items-center">
                        <input
                          {...register('preferredLanguages')}
                          type="checkbox"
                          value={lang.value}
                          checked={watchedLanguages.includes(lang.value)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{lang.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user?.preferredLanguages?.map((lang) => {
                      const langNames = {
                        en: 'Anglais',
                        ar: 'Arabe', 
                        fr: 'Français',
                        ja: 'Japonais',
                        es: 'Espagnol',
                        de: 'Allemand'
                      };
                      return (
                        <span
                          key={lang}
                          className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          {langNames[lang] || lang}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Informations du compte */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations du compte
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Membre depuis:</span>
                  <span className="text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut du compte:</span>
                  <span className="text-green-600 font-medium">Actif</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Section de sécurité */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Sécurité</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Mot de passe</h4>
              <p className="text-sm text-gray-600">
                Dernière modification il y a plus de 30 jours
              </p>
            </div>
            <button className="btn btn-outline btn-sm">
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;