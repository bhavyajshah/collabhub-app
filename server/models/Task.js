const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'todo' }, // 'todo' | 'in-progress' | 'done'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);
