const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation des erreurs
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Données invalides',
      errors: errors.array()
    });
  }
  next();
};

// POST /api/auth/register - Inscription
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, _ et -'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('preferredLanguages')
    .optional()
    .isArray()
    .withMessage('Les langues préférées doivent être un tableau')
], handleValidationErrors, async (req, res) => {
  try {
    const { username, email, password, preferredLanguages } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'Cet email est déjà utilisé' 
          : 'Ce nom d\'utilisateur est déjà pris'
      });
    }

    // Créer le nouvel utilisateur
    const user = new User({
      username,
      email,
      password,
      preferredLanguages: preferredLanguages || ['en', 'ar']
    });

    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// POST /api/auth/login - Connexion
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({ message: 'Compte désactivé' });
    }

    // Générer le token
    const token = generateToken(user._id);

    res.json({
      message: 'Connexion réussie',
      token,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
});

// GET /api/auth/me - Obtenir le profil utilisateur
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicJSON()
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/auth/profile - Mettre à jour le profil
router.put('/profile', authenticateToken, [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/),
  body('preferredLanguages')
    .optional()
    .isArray()
    .custom((languages) => {
      const validLanguages = ['en', 'ar', 'fr', 'ja', 'es', 'de'];
      return languages.every(lang => validLanguages.includes(lang));
    })
], handleValidationErrors, async (req, res) => {
  try {
    const { username, preferredLanguages } = req.body;
    const user = req.user;

    // Vérifier si le nouveau username est déjà pris
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
      }
      user.username = username;
    }

    if (preferredLanguages) {
      user.preferredLanguages = preferredLanguages;
    }

    await user.save();

    res.json({
      message: 'Profil mis à jour',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour' });
  }
});

// POST /api/auth/verify-token - Vérifier la validité du token
router.post('/verify-token', authenticateToken, (req, res) => {
  res.json({ 
    valid: true,
    user: req.user.toPublicJSON()
  });
});

module.exports = router;