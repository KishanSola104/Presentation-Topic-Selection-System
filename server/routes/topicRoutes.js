const express = require('express');
const router = express.Router();
const { updateTopic, deleteTopic } = require('../controllers/topicController');
const { protectTeacher } = require('../middleware/auth');

router.put('/:topicId', protectTeacher, updateTopic);
router.delete('/:topicId', protectTeacher, deleteTopic);

module.exports = router;
