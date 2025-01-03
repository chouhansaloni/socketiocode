import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Conversation', 
     required: true 
    },
  senderId: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     required: true 
    },
  content: {
     type: String,
      required: true
     },
  timestamp: {
     type: Date, 
     default: Date.now 
    },
  isRead: {
     type: Boolean, 
     default: false
     },
  reactions: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      reaction: {
         type: String
         },
    },
  ],
});

export default mongoose.model('Message', messageSchema);
