import Message from '../Models/message.model.js';

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;
    const message = await Message.create({ conversationId, senderId, content });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
