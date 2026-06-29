import express from 'express';
import Place from '../models/Place.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const sites = await Place.find({ category: 'heritage' });
    res.json(sites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const site = await Place.findById(req.params.id);
    if (!site) return res.status(404).json({ message: 'Site not found' });
    res.json(site);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;