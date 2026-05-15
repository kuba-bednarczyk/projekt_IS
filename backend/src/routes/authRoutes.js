const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  // 
  const email = req.body.email;
  const password = req.body.password;

  try {

    // zapytanie do bazy - szukanie po e-mailu - jest unikalny 
    const userQuery = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!userQuery) {
      return res.status(400).json({ error: "There's no such user."});
    }

    // porownywanie hasel
    const passwdMatch = await bcrypt.compare(password, userQuery.password);

    if (!passwdMatch) {
      return res.status(400).json({error: "Invalid password"});
    }

    const token = jwt.sign(
      {
        userId: userQuery.id,
        role: userQuery.role
      },
      JWT_SECRET,
      {expiresIn: '24h' }
    )

    // zwrocenie tokenu i roli użytkownika
    res.json({ token: token, role: userQuery.role })

  } catch(error) {
    res.status(500).json({error: "Internal Server Error"});
  }
})

module.exports = router;

// dodac w dataRoutes:
// const { verifyToken } = require('../middleware/auth');
// wpiecie middlewara w endpointy: router.get('/prices', verifyToken, async (req, res) => { ... }