const express = require('express');
const router = express.Router();
const { loginTeacher, getMe } = require('../controllers/authController');
const { protectTeacher } = require('../middleware/auth');

router.post('/login', loginTeacher);
router.get('/me', protectTeacher, getMe);

module.exports = router;
