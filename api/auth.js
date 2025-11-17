/**
 * Exemple d'utilisation de l'authentification
 * Route de login
 */

const express = require('express');
const { authenticateUser } = require('../utils/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Clé secrète JWT (à mettre dans config ou .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Authentifie l'utilisateur
  const user = authenticateUser(username, password);

  if (!user) {
    return res.status(401).json({ 
      error: 'Identifiants invalides' 
    });
  }

  // Génère un token JWT
  const token = jwt.sign(
    { 
      userId: user.id, 
      username: user.username,
      roleId: user.roleId 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Retourne le token et les infos utilisateur
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId
    }
  });
});

/**
 * GET /api/auth/me
 * Récupère les infos de l'utilisateur connecté
 */
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router;
