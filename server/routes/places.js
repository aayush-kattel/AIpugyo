import express from 'express';
import Place from '../models/Place.js';

const router = express.Router();

// Return tourist + trail (map shows all non-heritage)
router.get('/', async (req, res) => {
  try {
    const places = await Place.find({ category: { $in: ['tourist', 'trail'] } });
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
