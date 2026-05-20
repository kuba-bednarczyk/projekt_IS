const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const userQuery = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!userQuery) {
      return res.status(400).json({ error: "There's no such user."});
    }

    const passwdMatch = await bcrypt.compare(password, userQuery.password);

    if (!passwdMatch) {
      return res.status(400).json({error: "Invalid password"});
    }

    const token = jwt.sign(
      {
        userId: userQuery.id,
        email: userQuery.email,
        role: userQuery.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token });

  } catch(error) {
    res.status(500).json({error: "Internal Server Error"});
  }
});

// endpoint: sprawdza token JWT w naglowku Authorization, odczytuje z tokena id, email i role, zwraca w formacie json
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    userId: req.user.userId,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = router;
