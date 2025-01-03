import Conversation from '../Models/conversation.model.js';
import Message from '../Models/message.model.js';
import mongoose from 'mongoose';

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { participants } = req.body;

    if (!participants || participants.length < 2) {
      return res.status(400).json({ error: 'At least two participants are required' });
    }

    // Ensure each participant is a valid ObjectId
    for (const participant of participants) {
      if (!mongoose.Types.ObjectId.isValid(participant)) {
        return res.status(400).json({ error: `Invalid participant ID: ${participant}` });
      }
    }

    // Check if a conversation with these participants already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length },
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Create a new conversation
    const newConversation = new Conversation({ participants });
    await newConversation.save();

    res.status(201).json(newConversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Get details of a conversation
export const getConversationDetails = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const conversation = await Conversation.findById(conversationId)
      // .populate('participants', 'name email') // Populate participant details
      // .populate({
      //   path: 'lastMessage',
      //   select: 'content timestamp',
      // });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    res.status(500).json({ error: 'Failed to fetch conversation details' });
  }
};

// Get all conversations for a user
export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email')
      .populate({
        path: 'lastMessage',
        select: 'content timestamp',
      })
      .sort({ updatedAt: -1 }); // Sort by most recent update

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching user conversations:", error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Update the last message of a conversation
export const updateLastMessage = async (conversationId, messageId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(messageId)) {
    console.error("Invalid conversation or message ID");
    return;
  }

  try {
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: messageId,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("Error updating last message:", error);
  }
};

// Send a message and update conversation's lastMessage
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ error: 'Invalid conversation or sender ID' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const newMessage = new Message({
      conversationId,
      senderId,
      content,
    });

    await newMessage.save();

    await updateLastMessage(conversationId, newMessage._id);

    req.app.get('socketio').to(conversationId).emit('receiveMessage', {
      ...newMessage.toObject(),
      timestamp: new Date(),
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
