import express from 'express';
import {
  createConversation,
  getConversationDetails,
  getUserConversations,
} from '../Controllers/conversation.controller.js';

const router = express.Router();

// Create a new conversation
router.post('/', createConversation);

// Get details of a specific conversation
router.get('/:conversationId', getConversationDetails);

// Get all conversations for a specific user
router.get('/user/:userId', getUserConversations);

export default router;
