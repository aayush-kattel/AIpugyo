import express from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/weather/coordinates?lat=28.39&lng=84.12
router.get('/coordinates', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const r = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_KEY}&units=metric`
    );

    res.json({
      city: r.data.name,
      temp: r.data.main.temp,
      feels_like: r.data.main.feels_like,
      description: r.data.weather[0].description,
      humidity: r.data.main.humidity,
      wind: r.data.wind.speed,
      icon: r.data.weather[0].icon,
    });
  } catch (err) {
    res.status(500).json({ message: 'Location weather failed', error: err.message });
  }
});

export default router;