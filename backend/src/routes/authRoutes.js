const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const { verifyToken } = require("../middleware/auth");
const {userSchema} = require("../validations/userSchemas");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// endpoint rejestracji uzytkownika
router.post("/register", async (req, res) => {
  try {
    // walidacja z poziomu bazy danych 
    const validatedData = userSchema.safeParse(req.body);

    if (!validatedData.success) {
      const errors = validatedData.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
      return res.status(400).json({success: false, errors});
    }

    const {nickname, email, password } = validatedData.data;

    if (!nickname || !email || !password) {
      return res.status(400).json({error: "Wszystkie pola są wymagane"});
    }

    // sprawdzenie czy user o takim e-mailu juz istnieje w bazie 
    const exsistingUser = await prisma.user.findUnique({
      where: {email},
    });

    if (exsistingUser) {
      return res.status(400).json({error: "Użytkownik z tym adresem e-mail już istnieje."});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //utworzenie nowego usera
    const newUser = await prisma.user.create({
      data: {
        nickname,
        email,
        password: hashedPassword,
        role: "USER"
      }
    });

    // generowanie tokenu do automatycznego zalogowania
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
        role: newUser.role
      },
      JWT_SECRET,
      {expiresIn: "24h"}
    );

    // wysłanie ciasteczka autorazycajnego i odpowiedz 201
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24*60*60*1000
    });

    res.status(201).json({success: true});
  } catch (error) {
    console.error("Błąd podczas rejestracji: ", error);
    res.status(500).json({error: "Wewnętrzny błąd serwera."});
  }
})

// endpoint logowania z JWT i httpCookie
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail i hasło są wymagane" });
  }

  try {
    const userQuery = await prisma.user.findUnique({
      where: { email },
    });

    if (!userQuery) {
      return res.status(400).json({ error: "Niepoprawne dane." });
    }

    const passwdMatch = await bcrypt.compare(password, userQuery.password);

    if (!passwdMatch) {
      return res.status(400).json({ error: "Niepoprawne hasło." });
    }

    const token = jwt.sign(
      {
        userId: userQuery.id,
        email: userQuery.email,
        nickname: userQuery.nickname,
        role: userQuery.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.cookie("token", token, {
      httpOnly: true, // Całkowita blokada dostępu z poziomu JS (XSS Protection)
      secure: process.env.NODE_ENV === "production", // W produkcji wymagany HTTPS
      sameSite: "lax", // Ochrona przed CSRF
      maxAge: 24 * 60 * 60 * 1000, // 24 godziny
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Wewnętrzny błąd serwera" });
  }
});

// endpoint do wylogowywania
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// endpoint: sprawdza token JWT w naglowku Authorization, odczytuje z tokena id, email i role, zwraca w formacie json
router.get("/me", verifyToken, async (req, res) => {
  try {
    // Pobieramy zawsze świeże dane z bazy na podstawie ID zawartego w tokenie
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, role: true, nickname: true },
    });

    if (!currentUser) return res.status(404).json({ error: "Nie znaleziono użytkownika" });

    res.json({
      userId: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      nickname: currentUser.nickname,
    });
  } catch (error) {
    res.status(500).json({ error: "Wewnętrzny błąd serwera." });
  }
});

module.exports = router;
