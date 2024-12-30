import Conversation from '../Model/conversation.model.js';

// Create a conversation
export const createConversation = async (req, res) => {
  try {
    const { participants } = req.body;

    const newConversation = await Conversation.create({ participants });
    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Get conversation details
export const getConversationDetails = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId).populate('participants').populate('lastMessage');
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversation details' });
  }
};
