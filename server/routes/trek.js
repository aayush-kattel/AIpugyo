import express from 'express';
import Place from '../models/Place.js';

const router = express.Router();

router.get('/trails', async (req, res) => {
  try {
    const trails = await Place.find({ category: 'trail' });
    res.json(trails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/trails/:id', async (req, res) => {
  try {
    const trail = await Place.findById(req.params.id);
    if (!trail) return res.status(404).json({ message: 'Trail not found' });
    res.json(trail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;