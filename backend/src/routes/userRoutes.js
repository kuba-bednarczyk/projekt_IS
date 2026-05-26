const express = require("express");
const prisma = require("../config/db");
const router = express.Router();
const { userSchema } = require("../validations/userSchemas");
const { verifyToken, requireOwnerOrAdmin } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

const parseImage = (profilePicture) =>
  profilePicture
    ? Buffer.from(
        profilePicture.replace(/^data:\w+\/\w+;base64,/, ""),
        "base64",
      )
    : null;

const largeJsonParser = express.json({ limit: "3mb" });

router.get("/users", verifyToken, requireOwnerOrAdmin, async (req, res) => {
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
router.get("/users/:id", verifyToken, async (req, res) => {
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
router.get("/users/:id/picture", verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });
    if (!user?.profilePicture) return res.status(404).send("Not found");
    const { fileTypeFromBuffer } = await import("file-type");
    const typeInfo = await fileTypeFromBuffer(user.profilePicture);
    const mimeType = typeInfo?.mime ?? "image/jpeg";

    const base64 = Buffer.from(user.profilePicture).toString("base64");
    res.json({ profilePicture: `data:${mimeType};base64,${base64}` });
  } catch (error) {
    res.status(500).send("Server error");
  }
});
router.post(
  "/createUser",
  verifyToken,
  requireOwnerOrAdmin,
  largeJsonParser,
  async (req, res) => {
    try {
      const validatedData = userSchema.safeParse(req.body);
      if (!validatedData.success) {
        const errors = validatedData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          code: issue.code,
        }));
        return res.status(400).json({ success: false, errors });
      }
      const { nickname, email, password, role, profilePicture } =
        validatedData.data;
      if (await prisma.user.findUnique({ where: { email } })) {
        return res.status(400).json({
          success: false,
          message: "Użytkownik z tym emailem już istnieje",
        });
      }
      const userPassword = await bcrypt.hash(password, 10);
      if (profilePicture !== undefined) {
        imageParsed = profilePicture ? parseImage(profilePicture) : null;
      } else {
        imageParsed = undefined;
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
  },
);
router.delete(
  "/deleteUser/:id",
  verifyToken,
  requireOwnerOrAdmin,
  async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });
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
  },
);
router.patch(
  "/updateUser/:id",
  verifyToken,
  largeJsonParser,
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Nieprawidłowe ID użytkownika" });
      }
      const validatedData = userSchema.safeParse(req.body);
      if (!validatedData.success) {
        const errors = validatedData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          code: issue.code,
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
        validatedData.data.password = await bcrypt.hash(
          validatedData.data.password,
          10,
        );
      }
      if (validatedData.data.profilePicture !== undefined) {
        imageParsed = validatedData.data.profilePicture
          ? parseImage(validatedData.data.profilePicture)
          : null;
      } else {
        imageParsed = undefined;
      }
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          nickname: validatedData.data.nickname,
          email: validatedData.data.email,
          role: validatedData.data.role,
          password: validatedData.data.password,
          profilePicture: imageParsed,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Nie udało się zaktualizować użytkownika",
      });
    }
  },
);
module.exports = router;
