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
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reaction: { type: String }
    }
  ],
  image: {
    url: { type: String }, // Store the Cloudinary URL of the image
    public_id: { type: String } // Store the Cloudinary public ID for easy deletion
  }
});

// Export the model
export default mongoose.model('Message', messageSchema);
