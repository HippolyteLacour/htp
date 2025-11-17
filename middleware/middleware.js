// ...existing code...
const jwt = require('jsonwebtoken');

function requireWhiteAccess(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: "Accès refusé : token manquant." });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({ error: "Accès refusé : format d'en-tête invalide." });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || 'secret';

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Accès refusé : token invalide ou expiré." });
        }
        req.user = decoded;
        next();
    });
}

module.exports = requireWhiteAccess;
