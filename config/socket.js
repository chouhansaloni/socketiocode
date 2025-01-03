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

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
      console.log(io.sockets.adapter.rooms);
    });

    socket.on('sendMessage', async (data) => {
      const { conversationId, senderId, content } = data;
      try {
        const newMessage = await Message.create({
          conversationId,
          senderId,
          content,
        });
        console.log("message created :" + newMessage);
        await newMessage.save();
        
        io.to(conversationId).emit('receiveMessage', {
          ...newMessage.toObject(),
          timestamp: new Date(),
      });
      console.log(`Message sent to room: ${conversationId}`);
  } catch (error) {
      console.error("Error while saving message:", error);
  }
});

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initializeSocket;
