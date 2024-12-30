import mongoose from 'mongoose';
import Message from '../Model/message.model.js'; // adjust the path as necessary

// In message.controller.js, update sendMessage method
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;

    // Create the new message
    const message = new Message({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: new mongoose.Types.ObjectId(senderId),
      content,
    });

    // Save the message to the database
    await message.create();

    // Emit the message via Socket.IO after saving it
    const io = req.app.get('socketio');  // Get Socket.IO instance
    io.to(conversationId).emit('receiveMessage', {
      senderId,
      content,
      timestamp: new Date(),
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};


// Get messages by conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Update a message
export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(id, { content }, { new: true });
    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await Message.findByIdAndDelete(id);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedMessage = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// Add a reaction to a message
export const addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reaction } = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { $push: { reactions: { userId, reaction } } },
      { new: true }
    );

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reaction' });
  }
};

// Search messages
export const searchMessages = async (req, res) => {
  try {
    const { query } = req.query;

    const messages = await Message.find({
      content: { $regex: query, $options: 'i' },
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search messages' });
  }
};
