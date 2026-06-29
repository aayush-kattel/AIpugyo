import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String }, // groups messages into one conversation
  message: { type: String, required: true },
  reply: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('ChatHistory', chatSchema);
