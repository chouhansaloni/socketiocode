import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import messageRoutes from './Routes/message.routes.js';
import conversationRoutes from './Routes/conversation.routes.js';
import bodyParser from 'body-parser'; 
import message from './Model/message.model.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 60000,
})
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection failed:", error));

// Middleware
app.use(bodyParser.json());  // Parse JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));  // Parse URL-encoded payloads
 // API Routes
app.use('/api', messageRoutes);
app.use('/api', conversationRoutes);

// WebSocket and Socket.IO
app.set('socketio', io);

// In server.js, inside io.on('connection', ...) block
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // When a user joins a conversation
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // When a user sends a message
  socket.on('sendMessage', async (data) => {
    const { conversationId, senderId, content } = data;

    // Save the message (optional, if not handled inside the controller)
    // const message = new message({
    //   conversationId: new mongoose.Types.ObjectId(conversationId),
    //   senderId: new mongoose.Types.ObjectId(senderId),
    //   content,
    // });

    try {
      await message.create({
        conversationId: new mongoose.Types.ObjectId(conversationId),
        senderId: new mongoose.Types.ObjectId(senderId),
        content,
      });

  //     // Emit the message to all users in the conversation room
      io.to(conversationId).emit('receiveMessage', {
        senderId,
        content,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error while saving message:", error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
