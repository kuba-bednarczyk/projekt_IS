const express = require("express");
const prisma = require("../config/db");
const router = express.Router();
const { userSchema } = require("../validations/userSchemas");
const {
  verifyToken,
  requireOwnerOrAdmin,
  requireRole,
} = require("../middleware/auth");

const bcrypt = require("bcryptjs");
const { success } = require("zod");

const parseImage = (profilePicture) =>
  profilePicture
    ? Buffer.from(profilePicture.replace(/^data:.*?;base64,/, ""), "base64")
    : null;

router.get("/", verifyToken, requireRole("ADMIN"), async (req, res) => {
  try {
    // true = pobieramy te pola, false nie pobieramy pola
    // zakladam ze w tym widoku nie bedziemy wyswietlac zdj
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        email: true,
        role: true,
        password: true,
        profilePicture: false,
        createdAt: true,
      },
      orderBy: {
        role: "asc",
      },
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Nie udało się pobrać użytkowników",
    });
  }
});

router.get("/:id", verifyToken, requireOwnerOrAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });
    }

    // jest oddzielny endpoint dla zdj
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        nickname: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Nie znaleziono użytkownika",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Nie udało się pobrać użytkownika",
    });
  }
});

router.get("/:id/picture", verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });
    if (!user?.profilePicture) return res.status(200).send("Not found");

    const base64 = Buffer.from(user.profilePicture).toString("base64");

    // Proste zgadywanie MIME typu po "magic bytes" (nagłówkach formatu w Base64)
    // Eliminuje to crashowanie serwera w przypadku braku paczki "file-type"
    let mimeType = "image/jpeg";
    if (base64.startsWith("iVBORw0KGgo")) mimeType = "image/png";
    else if (base64.startsWith("R0lGOD")) mimeType = "image/gif";
    else if (base64.startsWith("UklGR")) mimeType = "image/webp";
    else if (base64.startsWith("PHN2Zw")) mimeType = "image/svg+xml";

    res.json({ profilePicture: `data:${mimeType};base64,${base64}` });
  } catch (error) {
    console.error("Błąd pobierania obrazka:", error);
    res.status(500).send("Server error");
  }
});

router.post("/", verifyToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const validatedData = userSchema.safeParse(req.body);
    if (!validatedData.success) {
      const errors = validatedData.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ success: false, errors });
    }
    const { nickname, email, password, role, profilePicture } =
      validatedData.data;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email i hasło są wymagane przy tworzeniu użytkownika",
      });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        errors: [{ field: "email", message: "Ten adres e-mail jest już przypisany do innego konta." }]
      });
    }

    if (nickname) {
      const existingNickname = await prisma.user.findUnique({ where: { nickname } });
      if (existingNickname) {
        return res.status(400).json({
          success: false,
          errors: [{ field: "nickname", message: "Ta nazwa użytkownika jest już zajęta." }]
        });
      }
    }

    const userPassword = await bcrypt.hash(password, 10);
    let imageParsed;
    if (profilePicture !== undefined) {
      imageParsed = profilePicture ? parseImage(profilePicture) : null;
    }
    const newUser = await prisma.user.create({
      data: {
        nickname,
        email,
        password: userPassword,
        role,
        profilePicture: imageParsed,
      },
      // true pobieramy pole, false nie pobieramy pola - te dane lecą na frontend w odpowiedzi
      select: {
        id: true,
        nickname: true,
        email: true,
        role: true,
        password: false,
        profilePicture: false,
        createdAt: true,
      },
    });
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Nie udało się utworzyć użytkownika",
    });
  }
});

router.delete("/:id", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });
  }

  const currentUserId = req.user.userId || req.user.id;
  if (userId === currentUserId) {
    return res.status(403).json({
      success: false,
      message: "Administrator nie moze usunac wlasnego konta.",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Nie znaleziono użytkownika",
      });
    }
    await prisma.user.delete({ where: { id: userId } });
    res
      .status(200)
      .json({ success: true, message: "Użytkownik został usunięty" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Nie udało się usunąć użytkownika",
    });
  }
});

router.patch("/:id", verifyToken, requireOwnerOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });
    }

    const currentUserId = req.user.userId || req.user.id;

    const validatedData = userSchema.partial().safeParse(req.body);
    if (!validatedData.success) {
      const errors = validatedData.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ success: false, errors });
    }
    if (!(await prisma.user.findUnique({ where: { id } }))) {
      return res.status(404).json({
        success: false,
        message: "Użytkownik z tym id nie istnieje",
      });
    }

    if (validatedData.data.password) {
      if (req.user.role === "ADMIN" && currentUserId !== id) {
        return res.status(403).json({
          success: false,
          message:
            "Administrator nie może zmieniać hasła innemu użytkownikowi.",
        });
      }
      validatedData.data.password = await bcrypt.hash(
        validatedData.data.password,
        10,
      );
    }

    if (validatedData.data.email) {
      const emailConflict = await prisma.user.findFirst({
        where: { email: validatedData.data.email, id: { not: id } },
      });
      if (emailConflict) {
        return res.status(400).json({
          success: false,
          errors: [{ field: "email", message: "Ten e-mail jest już zajęty." }]
        });
      }
    }

    if (validatedData.data.nickname) {
      const nicknameConflict = await prisma.user.findFirst({
        where: { nickname: validatedData.data.nickname, id: { not: id } },
      });
      if (nicknameConflict) {
        return res.status(400).json({
          success: false,
          errors: [{ field: "nickname", message: "Ta nazwa użytkownika jest już zajęta." }]
        });
      }
    }

    let imageParsed;
    if (validatedData.data.profilePicture !== undefined) {
      imageParsed = validatedData.data.profilePicture
        ? parseImage(validatedData.data.profilePicture)
        : null;
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        nickname: validatedData.data.nickname,
        email: validatedData.data.email,
        role: req.user.role === "ADMIN" ? validatedData.data.role : undefined,
        password: validatedData.data.password,
        profilePicture: imageParsed,
      },
      select: {
        id: true,
        nickname: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Nie udało się zaktualizować użytkownika",
    });
  }
});
module.exports = router;
