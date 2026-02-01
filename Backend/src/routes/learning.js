const express = require('express');
const { createLearningVideo, getChatStatus } = require('../controllers/learningController');
const { authenticate } = require('../middleware/auth');
const { validateCreateLearning } = require('../middleware/validation');

const router = express.Router();

router.post('/create-learning-video', authenticate, validateCreateLearning, createLearningVideo);
router.get('/chat/:chatId', authenticate, getChatStatus);

module.exports = router;