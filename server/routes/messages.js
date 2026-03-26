const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

router.get('/:channelId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ channelId: req.params.channelId })
      .populate('sender', 'username');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { channelId, text } = req.body;

    const message = new Message({
      channelId,
      sender: req.user.id,
      content: text
    });

    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
