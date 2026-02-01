const express = require('express');
const { uploadFile } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Optional haii flow mwin curr use nhi
router.post('/', authenticate, uploadFile);

module.exports = router;