import express from 'express';
import { createConversation, getConversationDetails } from '../Controller/conversation.controller.js';

const router = express.Router();

// Conversation Routes
router.post('/conversations', createConversation);
router.get('/conversations/:conversationId', getConversationDetails);

export default router;
