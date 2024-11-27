const express = require('express');
const messageController = require('../controllers/messageController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.get('/room/:roomId', authenticate, messageController.getRoomMessages);

module.exports = router;