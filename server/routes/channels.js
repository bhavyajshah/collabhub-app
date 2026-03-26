const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find().populate('members', 'username');
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    const channel = new Channel({
      name,
      description,
      members: [req.user.id],
      createdBy: req.user.id
    });

    await channel.save();

    res.json({ data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/join/:id', authMiddleware, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    channel.members.push(req.user.id);
    await channel.save();

    res.json({ message: 'Joined channel', channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/members', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('members');
    res.json(channel.members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
