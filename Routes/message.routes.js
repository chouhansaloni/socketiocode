import express from 'express';
import { sendMessage, getMessages } from '../Controllers/message.controller.js';

const router = express.Router();

router.post('/send', sendMessage);
router.get('/:conversationId', getMessages);

export default router;
