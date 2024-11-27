const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.get('/search', authenticate, userController.searchUsers);

module.exports = router;