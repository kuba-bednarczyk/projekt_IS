const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// weryfikacja tokenu
const verifyToken = (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ error: "Błąd: nie znaleziono klucza." });
  }

  // Szukamy tokena najpierw w ciasteczku, potem w headerze
  const token = req.cookies?.token || req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Odmowa dostępu: Brak tokena." });
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
      return res.status(401).json({ error: "Odmowa dostępu" });
    }

    if (req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ error: "Zabronione: niewystarczające uprawnienia." });
    }
    next();
  };
};

// pomocnicze sprawdzenie czy uzytkownik ma role user czy admin
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Odmowa dostępu" });
  }

  const ownerId = parseInt(req.params.id, 10);
  if (req.user.role === "ADMIN" || req.user.userId === ownerId) {
    return next();
  }

  return res.status(403).json({ error: "Zabronione: niewystarczające uprawnienia" });
};

module.exports = { verifyToken, requireRole, requireOwnerOrAdmin };
