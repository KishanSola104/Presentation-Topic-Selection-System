const express = require('express');
const router = express.Router();
const { releaseSelection } = require('../controllers/selectionController');
const { protectTeacher } = require('../middleware/auth');

// Teacher release / repost topic
router.delete('/:selectionId', protectTeacher, releaseSelection);

module.exports = router;
