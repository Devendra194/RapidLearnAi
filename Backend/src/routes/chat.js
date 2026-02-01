const express = require('express');
const { getUserChats } = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getUserChats);

module.exports = router;