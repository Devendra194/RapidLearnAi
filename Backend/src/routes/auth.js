const express = require('express');
const { signup, login, getCurrentUser, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/user', authenticate, getCurrentUser);
router.post('/logout', authenticate, logout);

module.exports = router;