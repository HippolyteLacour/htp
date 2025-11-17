

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const users = require('../mockDB/users');

/**
 * Vérifie un mot de passe
 */
function verifyPassword(password, hash, salt) {
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return hash === verifyHash;
}

/**
 * Hash un mot de passe
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return { salt, hash };
}


function authenticateUser(username, password) {
  // Trouve l'utilisateur
  const user = users.find(
    u => u.username === username || u.name === username || u.email === username
  );

  if (!user) {
    return null;
  }

  // Vérifie le mot de passe
  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);

  if (!isValid) {
    return null;
  }

  // Retourne l'utilisateur sans les infos sensibles
  const { passwordHash, passwordSalt, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Génère un token JWT
 */
function generateToken(payload, secret, expiresIn = '24h') {
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Vérifie un token JWT
 */
function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

/**
 * Middleware Express pour vérifier l'authentification
 */
function authMiddleware(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Username et password requis' 
    });
  }

  const user = authenticateUser(username, password);

  if (!user) {
    return res.status(401).json({ 
      error: 'Identifiants invalides' 
    });
  }

  // Ajoute l'utilisateur à la requête
  req.user = user;
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  authenticateUser,
  generateToken,
  verifyToken,
  authMiddleware
};
