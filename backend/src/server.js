require('dotenv').config();

const express = require('express');
const cors = require('cors');
const prisma = require('./config/db'); // połączenie z bazą 

const dataRoutes = require('./routes/dataRoutes'); //import routow
const authRoutes = require('./routes/authRoutes');
const exportRoutes = require("./routes/exportRoutes"); 

const app = express();

// Middleware
app.use(cors()); //dla reacta - dostep do API
app.use(express.json()); // pozwala czytac dane z bazy

app.use('/api', dataRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/export", exportRoutes);

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
