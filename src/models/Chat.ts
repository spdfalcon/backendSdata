import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  title: string;
  user: mongoose.Types.ObjectId;
  guestId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    title: {
      type: String,
      required: [true, 'عنوان چت الزامی است'],
      default: 'گفتگوی جدید',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    guestId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
chatSchema.index({ user: 1 });
chatSchema.index({ guestId: 1 });

const Chat = mongoose.model<IChat>('Chat', chatSchema);

export default Chat; 