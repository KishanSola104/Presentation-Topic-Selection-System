const Presentation = require('../models/Presentation');
const Topic = require('../models/Topic');
const Selection = require('../models/Selection');

// Helper to attach topic counts to presentation documents
const attachCounts = async (presentations) => {
  const results = await Promise.all(
    presentations.map(async (pres) => {
      const presObj = pres.toObject ? pres.toObject() : pres;
      const totalTopics = await Topic.countDocuments({ presentationId: pres._id });
      const selectedTopics = await Topic.countDocuments({
        presentationId: pres._id,
        status: 'selected'
      });
      return {
        ...presObj,
        totalTopics: totalTopics || pres.numberOfTopics,
        selectedTopics,
        remainingTopics: Math.max(0, (totalTopics || pres.numberOfTopics) - selectedTopics)
      };
    })
  );
  return results;
};

// @desc    Get all presentations for teacher
// @route   GET /api/presentations
// @access  Private (Teacher)
const getPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.find().sort({ createdAt: -1 });
    const withCounts = await attachCounts(presentations);
    return res.json(withCounts);
  } catch (error) {
    console.error('getPresentations error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Get dashboard summary statistics
// @route   GET /api/presentations/stats
// @access  Private (Teacher)
const getDashboardStats = async (req, res) => {
  try {
    const total = await Presentation.countDocuments();
    const open = await Presentation.countDocuments({ status: 'published' });
    const locked = await Presentation.countDocuments({ status: 'locked' });
    const draft = await Presentation.countDocuments({ status: 'draft' });

    return res.json({
      total,
      open,
      locked,
      draft
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Get published / open presentations
// @route   GET /api/presentations/open
// @access  Private (Teacher)
const getOpenPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.find({ status: 'published' }).sort({ createdAt: -1 });
    const withCounts = await attachCounts(presentations);
    return res.json(withCounts);
  } catch (error) {
    console.error('getOpenPresentations error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Get locked presentations
// @route   GET /api/presentations/locked
// @access  Private (Teacher)
const getLockedPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.find({ status: 'locked' }).sort({ createdAt: -1 });
    const withCounts = await attachCounts(presentations);
    return res.json(withCounts);
  } catch (error) {
    console.error('getLockedPresentations error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Get presentation by ID
// @route   GET /api/presentations/:id
// @access  Private (Teacher)
const getPresentationById = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    const topics = await Topic.find({ presentationId: presentation._id }).sort({ topicNumber: 1 });
    const selectedCount = topics.filter(t => t.status === 'selected').length;

    const presObj = presentation.toObject();
    presObj.totalTopics = topics.length || presentation.numberOfTopics;
    presObj.selectedTopics = selectedCount;
    presObj.remainingTopics = Math.max(0, presObj.totalTopics - selectedCount);
    presObj.topics = topics;

    return res.json(presObj);
  } catch (error) {
    console.error('getPresentationById error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Create new presentation (status: draft)
// @route   POST /api/presentations
// @access  Private (Teacher)
const createPresentation = async (req, res) => {
  try {
    const { subjectCode, subjectName, presentationDate, numberOfTopics } = req.body;

    if (!subjectCode || !subjectName || !presentationDate || !numberOfTopics) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const count = parseInt(numberOfTopics, 10);
    if (isNaN(count) || count <= 0) {
      return res.status(400).json({ message: 'Number of topics must be greater than zero.' });
    }

    const presentation = await Presentation.create({
      subjectCode: subjectCode.trim(),
      subjectName: subjectName.trim(),
      presentationDate: presentationDate.trim(),
      numberOfTopics: count,
      status: 'draft'
    });

    // Create placeholder topics
    const topicDocs = [];
    for (let i = 1; i <= count; i++) {
      topicDocs.push({
        presentationId: presentation._id,
        topicNumber: i,
        title: '',
        status: 'available'
      });
    }
    if (topicDocs.length > 0) {
      await Topic.insertMany(topicDocs);
    }

    return res.status(201).json(presentation);
  } catch (error) {
    console.error('createPresentation error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Update presentation details
// @route   PUT /api/presentations/:id
// @access  Private (Teacher)
const updatePresentation = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    if (presentation.status === 'locked') {
      return res.status(400).json({ message: 'Locked presentations cannot be edited. Please unlock first.' });
    }

    const { subjectCode, subjectName, presentationDate, numberOfTopics } = req.body;

    if (subjectCode) presentation.subjectCode = subjectCode.trim();
    if (subjectName) presentation.subjectName = subjectName.trim();
    if (presentationDate) presentation.presentationDate = presentationDate.trim();

    if (numberOfTopics !== undefined) {
      const newCount = parseInt(numberOfTopics, 10);
      if (isNaN(newCount) || newCount <= 0) {
        return res.status(400).json({ message: 'Number of topics must be greater than zero.' });
      }

      const existingTopics = await Topic.find({ presentationId: presentation._id }).sort({ topicNumber: 1 });
      const currentCount = existingTopics.length;

      if (newCount > currentCount) {
        // Add additional topics
        const newDocs = [];
        for (let i = currentCount + 1; i <= newCount; i++) {
          newDocs.push({
            presentationId: presentation._id,
            topicNumber: i,
            title: '',
            status: 'available'
          });
        }
        await Topic.insertMany(newDocs);
      } else if (newCount < currentCount) {
        // Check if any topics to be removed are selected
        const topicsToRemove = existingTopics.slice(newCount);
        const hasSelected = topicsToRemove.some(t => t.status === 'selected');
        if (hasSelected) {
          return res.status(400).json({
            message: 'Cannot reduce number of topics because some trailing topics are already selected by students.'
          });
        }
        const idsToRemove = topicsToRemove.map(t => t._id);
        await Topic.deleteMany({ _id: { $in: idsToRemove } });
      }

      presentation.numberOfTopics = newCount;
    }

    await presentation.save();
    return res.json(presentation);
  } catch (error) {
    console.error('updatePresentation error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Delete presentation
// @route   DELETE /api/presentations/:id
// @access  Private (Teacher)
const deletePresentation = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    // Delete associated selections and topics
    await Selection.deleteMany({ presentationId: presentation._id });
    await Topic.deleteMany({ presentationId: presentation._id });
    await Presentation.findByIdAndDelete(presentation._id);

    return res.json({ message: 'Presentation deleted successfully.' });
  } catch (error) {
    console.error('deletePresentation error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Publish presentation
// @route   PUT /api/presentations/:id/publish
// @access  Private (Teacher)
const publishPresentation = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    if (!presentation.subjectCode || !presentation.subjectName || !presentation.presentationDate) {
      return res.status(400).json({ message: 'Please ensure all presentation details are filled.' });
    }

    const topics = await Topic.find({ presentationId: presentation._id }).sort({ topicNumber: 1 });
    if (topics.length === 0) {
      return res.status(400).json({ message: 'Please add topics before publishing.' });
    }

    // Check all topic titles are non-empty
    const emptyTopic = topics.find(t => !t.title || t.title.trim() === '');
    if (emptyTopic) {
      return res.status(400).json({
        message: `Topic ${emptyTopic.topicNumber} is missing a title. All topic titles must be filled before publishing.`
      });
    }

    presentation.status = 'published';
    await presentation.save();

    return res.json({ message: 'Presentation published successfully.', presentation });
  } catch (error) {
    console.error('publishPresentation error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Lock presentation
// @route   PUT /api/presentations/:id/lock
// @access  Private (Teacher)
const lockPresentation = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    presentation.status = 'locked';
    await presentation.save();

    return res.json({ message: 'Presentation locked successfully.', presentation });
  } catch (error) {
    console.error('lockPresentation error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Unlock presentation
// @route   PUT /api/presentations/:id/unlock
// @access  Private (Teacher)
const unlockPresentation = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    presentation.status = 'published';
    await presentation.save();

    return res.json({ message: 'Presentation unlocked successfully.', presentation });
  } catch (error) {
    console.error('unlockPresentation error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

module.exports = {
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
};
