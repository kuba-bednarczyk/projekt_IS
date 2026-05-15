const express = require('express');
const prisma = require('../config/db'); 
const router = express.Router();

// Pobieranie wszystkich miast (idealne do listy rozwijanej na froncie)
router.get('/cities', async (req, res) => {
    try {
        const cities = await prisma.city.findMany({
            orderBy: { name: 'asc' } // Od razu sortujemy alfabetycznie dla wygody
        });
        res.json(cities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Nie udało się pobrać miast" });
    }
});

// Pobieranie cen mieszkań (z opcją filtrowania)
router.get('/prices', async (req, res) => {
    const { cityId, marketType } = req.query;

    try {
        const prices = await prisma.housingPrice.findMany({
            where: {
                ...(cityId && { cityId: parseInt(cityId) }),
                ...(marketType && { marketType: marketType })
            },
            orderBy: [
                { year: 'asc' },    
                { quarter: 'asc' }
            ]
        });
        res.json(prices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Nie udało się pobrać cen mieszkań" });
    }
});

module.exports = router;