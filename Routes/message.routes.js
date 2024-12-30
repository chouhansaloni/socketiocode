import express from 'express';
import { 
  sendMessage, 
  getMessages, 
  updateMessage, 
  deleteMessage, 
  markAsRead, 
  addReaction, 
  searchMessages 
} from '../Controller/message.controller.js';

const router = express.Router();

// Define your routes
router.post('/send', sendMessage);
router.get('/messages/:conversationId', getMessages);
router.patch('/messages/:id', updateMessage);
router.delete('/messages/:id', deleteMessage);
router.patch('/messages/:id/markAsRead', markAsRead);
router.post('/messages/:id/reactions', addReaction);
router.get('/messages/search', searchMessages);

export default router;
