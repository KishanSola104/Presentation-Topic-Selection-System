const express = require('express');
const router = express.Router();
const {
  getStudentPresentations,
  getStudentPresentationDetails
} = require('../controllers/selectionController');

router.get('/presentations', getStudentPresentations);
router.get('/presentations/:id', getStudentPresentationDetails);

module.exports = router;
