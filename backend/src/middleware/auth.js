const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({error: "Error: JWT secret key is missing"});
  }

  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({error: "Access denied: Missing authorization ."});
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({error: "Access denied: Token not provided"});
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({error: "Forbidden: invalid or expired token"}); 
  }
}

module.exports = {verifyToken};