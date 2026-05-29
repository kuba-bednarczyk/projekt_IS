require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const prisma = require("./config/db"); // połączenie z bazą

const dataRoutes = require("./routes/dataRoutes"); //import routow
const authRoutes = require("./routes/authRoutes"); // autoryzacja
const exportRoutes = require("./routes/exportRoutes"); // import routeow do eksportu danych
const userRoutes = require("./routes/userRoutes"); // import routow uzytkownikow
const importRoutes = require("./routes/importRoutes"); // obsluga importu i usuwania danych z db

const app = express();

// Middleware
// zmiana ustawien cors pod httpCookie
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" })); // pozwala czytac dane z bazy (limit zwiększony dla zdjęć Base64)
app.use(cookieParser()); // do obsługi ciasteczek HttpOnly

app.use("/api", dataRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/import", importRoutes);

// endpoint testowy STATUS
app.get("/api/status", async (req, res) => {
  try {
    // probne zapytanie do bazy
    const cityCount = await prisma.city.count();
    res.json({
      status: "Server is running.",
      miastaWBazie: cityCount,
    });
  } catch (error) {
    console.error("Błąd bazy danych:", error);
    res.status(500).json({ error: "Serwer is running. Database is down." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on : http://localhost:${PORT}`);
});
