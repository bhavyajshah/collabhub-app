import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  channelId: mongoose.Types.ObjectId;
  assignedUser: mongoose.Types.ObjectId;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
}

const taskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  status: { type: String, default: 'todo', enum: ['todo', 'in-progress', 'done'], index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default mongoose.model<ITask>('Task', taskSchema);
