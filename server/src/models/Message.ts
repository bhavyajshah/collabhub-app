import mongoose, { Schema, Document } from 'mongoose';

export type MessageType = 'standard' | 'update' | 'decision' | 'blocker';

export interface IMessageReadReceipt {
  user: mongoose.Types.ObjectId;
  readAt: Date;
}

export interface IMessageReplyPreview {
  messageId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  content: string;
  type: MessageType;
}

export interface IMessage extends Document {
  channelId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: MessageType;
  replyPreview?: IMessageReplyPreview;
  readBy: IMessageReadReceipt[];
  timestamp: Date;
  editedAt?: Date;
}

const readReceiptSchema = new Schema<IMessageReadReceipt>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const replyPreviewSchema = new Schema<IMessageReplyPreview>(
  {
    messageId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['standard', 'update', 'decision', 'blocker'],
      default: 'standard'
    }
  },
  { _id: false }
);

const messageSchema: Schema = new Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['standard', 'update', 'decision', 'blocker'],
    default: 'standard'
  },
  replyPreview: { type: replyPreviewSchema, required: false },
  readBy: {
    type: [readReceiptSchema],
    default: []
  },
  timestamp: { type: Date, default: Date.now, index: true },
  editedAt: { type: Date, required: false }
});

// Compound index for faster retrieval of channel messages sorted by time
messageSchema.index({ channelId: 1, timestamp: -1 });
messageSchema.index({ channelId: 1, 'readBy.user': 1 });

export default mongoose.model<IMessage>('Message', messageSchema);
