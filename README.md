# 📚 Read Manga - Application de Lecture de Mangas

Une application web full-stack moderne pour lire des mangas en utilisant l'API MangaDex. Développée avec React (frontend) et Node.js/Express (backend), avec authentification JWT et système de favoris.

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription et connexion avec JWT
- Gestion de profil utilisateur
- Préférences de langues (EN, AR, FR, JA, ES, DE)

### 📖 Lecture de Mangas
- Recherche de mangas par titre
- Navigation par chapitres
- Lecteur d'images optimisé avec contrôles clavier
- Zoom et navigation fluide
- Support multi-langues

### ❤️ Gestion des Favoris
- Ajouter/retirer des mangas en favoris
- Suivi des nouveaux chapitres
- Marquer les chapitres comme lus
- Statistiques personnelles

### 🚀 Fonctionnalités Techniques
- API proxy pour contourner CORS avec MangaDex
- Cache en mémoire pour optimiser les performances
- Rate limiting pour la sécurité
- Interface responsive avec Tailwind CSS
- Gestion d'état avec React Query

## 🛠️ Stack Technique

### Backend
- **Node.js** avec Express.js
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **bcryptjs** pour le hashing des mots de passe
- **Axios** pour les appels API MangaDex
- **Helmet** et middleware de sécurité
- **Rate limiting** avec express-rate-limit

### Frontend
- **React 18** avec hooks
- **Vite** pour le build et dev server
- **React Router** pour la navigation
- **React Query** pour la gestion des données
- **React Hook Form** pour les formulaires
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes

## 📁 Structure du Projet

```
Read-Manga/
├── backend/                 # Serveur Node.js/Express
│   ├── src/
│   │   ├── routes/         # Routes API (auth, manga, favorites)
│   │   ├── models/         # Modèles MongoDB (User, Favorite)
│   │   ├── middleware/     # Middleware d'auth et sécurité
│   │   ├── services/       # Services API (MangaDex proxy)
│   │   └── server.js       # Point d'entrée du serveur
│   ├── package.json
│   └── .env.example
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API et utilitaires
│   │   ├── contexts/       # Contextes React (Auth)
│   │   └── App.jsx         # Composant principal
│   ├── package.json
│   └── vite.config.js
├── package.json            # Scripts racine
└── README.md
```

## 🚀 Installation et Configuration

### Prérequis
- **Node.js** (version 16 ou supérieure)
- **MongoDB** (local ou MongoDB Atlas)
- **npm** ou **yarn**

### 1. Cloner le projet
```bash
git clone <repository-url>
cd Read-Manga
```

### 2. Installation des dépendances
```bash
# Installer toutes les dépendances (backend + frontend)
npm run install:all

# Ou manuellement:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configuration Backend

#### Variables d'environnement
Créer un fichier `.env` dans le dossier `backend/` en copiant `.env.example`:

```bash
cd backend
cp .env.example .env
```

Modifier le fichier `.env` avec vos configurations:

```env
# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/read-manga
# ou pour MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/read-manga

# JWT Secret (générez une clé secrète forte)
JWT_SECRET=votre-cle-secrete-jwt-tres-longue-et-securisee

# Configuration serveur
PORT=5000
NODE_ENV=development

# URL du frontend pour CORS
FRONTEND_URL=http://localhost:5173

# Cache TTL en secondes
CACHE_TTL=300
```

#### Générer une clé JWT sécurisée
```bash
# Avec Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Ou avec OpenSSL
openssl rand -hex 64
```

### 4. Configuration Frontend

Créer un fichier `.env` dans le dossier `frontend/` (optionnel):

```env
# URL de l'API backend
VITE_API_URL=http://localhost:5000/api
```

### 5. Configuration MongoDB

#### Option A: MongoDB Local
1. Installer MongoDB Community Edition
2. Démarrer le service MongoDB
3. La base `read-manga` sera créée automatiquement

#### Option B: MongoDB Atlas (Cloud)
1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un cluster gratuit
3. Obtenir la chaîne de connexion
4. Mettre à jour `MONGODB_URI` dans `.env`

## 🎯 Lancement de l'Application

### Développement (recommandé)
```bash
# Démarrer backend et frontend simultanément
npm run dev
```

Cette commande lance:
- Backend sur http://localhost:5000
- Frontend sur http://localhost:5173

### Lancement séparé
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend  
npm run dev:frontend
```

### Production
```bash
# Build du frontend
npm run build

# Démarrer le serveur de production
npm start
```

## 📱 Utilisation

### Première utilisation
1. Accéder à http://localhost:5173
2. Créer un compte via "Inscription"
3. Se connecter avec vos identifiants
4. Commencer à explorer les mangas!

### Fonctionnalités principales
- **Recherche**: Utiliser la barre de recherche pour trouver des mangas
- **Lecture**: Cliquer sur un manga → Voir les chapitres → Commencer la lecture
- **Favoris**: Ajouter des mangas à vos favoris pour les suivre
- **Profil**: Modifier vos préférences de langues

### Raccourcis clavier (Lecteur)
- `←` / `→` : Navigation entre pages
- `Home` / `End` : Première/Dernière page
- `Escape` : Retour au manga

## 🔧 Scripts Disponibles

### Scripts Racine
```bash
npm run install:all    # Installer toutes les dépendances
npm run dev            # Dev backend + frontend
npm run dev:backend    # Dev backend uniquement
npm run dev:frontend   # Dev frontend uniquement
npm run build          # Build production frontend
npm start              # Démarrer serveur production
```

### Scripts Backend
```bash
cd backend
npm start              # Production
npm run dev            # Développement avec nodemon
```

### Scripts Frontend
```bash
cd frontend
npm run dev            # Serveur de développement
npm run build          # Build de production
npm run preview        # Prévisualiser le build
```

## 🛡️ Sécurité

### Mesures implémentées
- **Helmet.js** pour les en-têtes de sécurité
- **Rate limiting** sur les routes API
- **Validation des données** avec express-validator
- **Hashing bcrypt** pour les mots de passe
- **JWT** avec expiration (7 jours)
- **CORS** configuré spécifiquement

### Recommandations production
1. Utiliser HTTPS
2. Configurer un JWT_SECRET fort
3. Mettre à jour les variables d'environnement
4. Configurer un reverse proxy (nginx)
5. Monitoring et logs

## 🔍 API Endpoints

### Authentification (`/api/auth`)
- `POST /register` - Inscription
- `POST /login` - Connexion
- `GET /me` - Profil utilisateur
- `PUT /profile` - Mettre à jour profil
- `POST /verify-token` - Vérifier token

### Mangas (`/api/manga`)
- `GET /search` - Rechercher mangas
- `GET /popular` - Mangas populaires
- `GET /:id` - Détails d'un manga
- `GET /:id/chapters` - Chapitres d'un manga
- `GET /chapter/:id/pages` - Pages d'un chapitre

### Favoris (`/api/favorites`)
- `GET /` - Liste des favoris
- `POST /` - Ajouter un favori
- `GET /check/:id` - Vérifier si en favori
- `PUT /:id` - Mettre à jour favori
- `POST /:id/read` - Marquer chapitre lu
- `DELETE /:id` - Supprimer favori
- `GET /stats` - Statistiques favoris

## 🐛 Dépannage

### Problèmes courants

#### "Cannot connect to MongoDB"
- Vérifier que MongoDB est démarré
- Vérifier l'URL de connexion dans `.env`
- Pour Atlas: vérifier IP whitelist et credentials

#### "CORS Error"
- Vérifier que `FRONTEND_URL` est correct dans `.env`
- Vérifier que les ports correspondent

#### "JWT Error" / Token invalide
- Vérifier que `JWT_SECRET` est défini
- Clear localStorage du navigateur
- Redémarrer le serveur backend

#### Images de manga ne se chargent pas
- Problème normal avec MangaDex (rate limiting)
- Les images placeholder sont affichées automatiquement

### Logs et Debug
```bash
# Logs backend
cd backend && npm run dev

# Mode debug avec plus de logs
DEBUG=* npm run dev
```

## 🤝 Contribution

### Structure de développement
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changes (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code
- ESLint pour le code quality
- Prettier pour le formatage
- Conventional Commits
- Tests avec Jest (à implémenter)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **MangaDex** pour leur API publique exceptionnelle
- **React** et **Node.js** communities
- **Tailwind CSS** pour le styling moderne
- Tous les contributeurs open source

## 📞 Support

Pour toute question ou problème:
1. Vérifier la section Dépannage
2. Ouvrir une issue sur GitHub
3. Consulter la documentation MangaDex API

---

**Note**: Cette application est à des fins éducatives. Respectez les droits d'auteur des mangas et les conditions d'utilisation de MangaDex.

