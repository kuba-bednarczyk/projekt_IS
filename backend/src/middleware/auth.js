const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// weryfikacja tokenu
const verifyToken = (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: "Error: JWT secret key is missing" });
  }

  // Szukamy tokena najpierw w ciasteczku (frontend), potem w headerze (np. dla postmana)
  const token = req.cookies?.token || req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied: Missing token." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ error: "Forbidden: invalid or expired token" });
  }
};

// pomocnicze spradzenie roli
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Access denied" });
    }

    if (req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

// pomocnicze sprawdzenie czy uzytkownik ma role user czy admin
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Access denied" });
  }

  const ownerId = parseInt(req.params.id, 10);
  if (req.user.role === "ADMIN" || req.user.userId === ownerId) {
    return next();
  }

  return res.status(403).json({ error: "Forbidden: insufficient permissions" });
};

module.exports = { verifyToken, requireRole, requireOwnerOrAdmin };
