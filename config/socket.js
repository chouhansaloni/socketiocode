import cloudinary from '../config/cloudinary.js';
import { Server } from 'socket.io';
import Message from '../Models/message.model.js';

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });
  
  console.log(process.env.CLOUDINARY_CLOUD_NAME);
  console.log(process.env.CLOUDINARY_API_KEY);
  console.log(process.env.CLOUDINARY_API_SECRET);
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      const { conversationId, senderId, content, imageFile } = data;
      try {
        let image = null;

        // If an image file (base64) is provided, upload it to Cloudinary
        if (imageFile) {
          const uploadResponse = await cloudinary.v2.uploader.upload(imageFile, {
            folder: 'chat_images', // Specify folder in Cloudinary
          });
          image = {
            url: uploadResponse.secure_url,
            public_id: uploadResponse.public_id,
          };
        }

        // Create the message
        const newMessage = await Message.create({
          conversationId,
          senderId,
          content,
          image, // Add image details to the message
        });

        // Broadcast the new message to the conversation room
        io.to(conversationId).emit('receiveMessage', {
          ...newMessage.toObject(),
          timestamp: new Date(),
        });
        console.log(`Message sent to room: ${conversationId}`);

      } catch (error) {
        console.error("Error while saving message:", error);
      }
    });

    // Handle marking message as read
    socket.on('markAsRead', async (data) => {
      const { messageId } = data;
      try {
        await Message.findByIdAndUpdate(messageId, { isRead: true });
        console.log(`Message ${messageId} marked as read`);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initializeSocket;
