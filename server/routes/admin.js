import express from 'express';
import User from '../models/User.js';
import ChatHistory from '../models/ChatHistory.js';
import Place from '../models/Place.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Middleware: admin only
function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
}

// GET /api/admin/dashboard — stats
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalChats = await ChatHistory.countDocuments();
    const totalPlaces = await Place.countDocuments();
    const totalHeritage = await Place.countDocuments({ category: 'heritage' });
    res.json({ totalUsers, totalChats, totalPlaces, totalHeritage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users — all users with stats
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select('-password')
      .sort({ createdAt: -1 });

    // Attach chat count per user
    const withStats = await Promise.all(users.map(async u => {
      const chatCount = await ChatHistory.countDocuments({ userId: u._id });
      return {
        ...u.toObject(),
        chatCount,
      };
    }));

    res.json(withStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/chats — recent chat logs
router.get('/chats', auth, adminOnly, async (req, res) => {
  try {
    const chats = await ChatHistory.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await ChatHistory.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
