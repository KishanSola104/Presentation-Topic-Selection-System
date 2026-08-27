const express = require('express');
const router = express.Router();
const {
  getPresentations,
  getDashboardStats,
  getOpenPresentations,
  getLockedPresentations,
  getPresentationById,
  createPresentation,
  updatePresentation,
  deletePresentation,
  publishPresentation,
  lockPresentation,
  unlockPresentation
} = require('../controllers/presentationController');

const {
  getTopicsByPresentation,
  savePresentationTopics
} = require('../controllers/topicController');

const {
  selectTopic,
  getPresentationSelections
} = require('../controllers/selectionController');

const { protectTeacher } = require('../middleware/auth');

// Presentation stats & lists for teacher
router.get('/stats', protectTeacher, getDashboardStats);
router.get('/open', protectTeacher, getOpenPresentations);
router.get('/locked', protectTeacher, getLockedPresentations);

// General presentation CRUD
router.get('/', protectTeacher, getPresentations);
router.post('/', protectTeacher, createPresentation);
router.get('/:id', protectTeacher, getPresentationById);
router.put('/:id', protectTeacher, updatePresentation);
router.delete('/:id', protectTeacher, deletePresentation);

// Presentation status lifecycle
router.put('/:id/publish', protectTeacher, publishPresentation);
router.put('/:id/lock', protectTeacher, lockPresentation);
router.put('/:id/unlock', protectTeacher, unlockPresentation);

// Topics sub-routes
router.get('/:id/topics', getTopicsByPresentation);
router.post('/:id/topics', protectTeacher, savePresentationTopics);

// Selection sub-routes
router.post('/:id/select-topic', selectTopic);
router.get('/:id/selections', protectTeacher, getPresentationSelections);

module.exports = router;
