import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  chat: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  guestId?: string;
  isAI: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: [true, 'محتوای پیام الزامی است'],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    guestId: {
      type: String,
    },
    isAI: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
messageSchema.index({ chat: 1 });
messageSchema.index({ user: 1 });
messageSchema.index({ guestId: 1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message; 