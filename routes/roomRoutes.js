const express = require('express');
const roomController = require('../controllers/roomController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/create', authenticate, roomController.createRoom);
router.post('/join', authenticate, roomController.joinRoom);
router.get('/', authenticate, roomController.listRooms);
router.get('/:roomId/users', authenticate, roomController.getRoomUsers);

module.exports = router;