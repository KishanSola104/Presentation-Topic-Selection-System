const Selection = require('../models/Selection');
const Topic = require('../models/Topic');
const Presentation = require('../models/Presentation');

// @desc    Get published presentations for students
// @route   GET /api/student/presentations
// @access  Public
const getStudentPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.find({ status: 'published' }).sort({ createdAt: -1 });
    const list = await Promise.all(
      presentations.map(async (pres) => {
        const availableTopics = await Topic.countDocuments({
          presentationId: pres._id,
          status: 'available',
          title: { $ne: '' }
        });
        const totalTopics = await Topic.countDocuments({ presentationId: pres._id });
        return {
          _id: pres._id,
          subjectCode: pres.subjectCode,
          subjectName: pres.subjectName,
          presentationDate: pres.presentationDate,
          totalTopics: totalTopics || pres.numberOfTopics,
          availableTopics,
          status: pres.status
        };
      })
    );
    return res.json(list);
  } catch (error) {
    console.error('getStudentPresentations error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Get presentation and available topics for student
// @route   GET /api/student/presentations/:id
// @access  Public
const getStudentPresentationDetails = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation || presentation.status === 'draft') {
      return res.status(404).json({ message: 'Presentation not found or not published.' });
    }

    const isLocked = presentation.status === 'locked';

    // Get only available topics with non-empty titles
    const availableTopics = await Topic.find({
      presentationId: presentation._id,
      status: 'available',
      title: { $ne: '' }
    }).sort({ topicNumber: 1 });

    const totalTopicsCount = await Topic.countDocuments({ presentationId: presentation._id });

    return res.json({
      _id: presentation._id,
      subjectCode: presentation.subjectCode,
      subjectName: presentation.subjectName,
      presentationDate: presentation.presentationDate,
      numberOfTopics: totalTopicsCount || presentation.numberOfTopics,
      availableCount: availableTopics.length,
      status: presentation.status,
      isLocked,
      topics: isLocked ? [] : availableTopics.map(t => ({
        _id: t._id,
        topicNumber: t.topicNumber,
        title: t.title
      }))
    });
  } catch (error) {
    console.error('getStudentPresentationDetails error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Select a topic (FCFS Atomic Operation)
// @route   POST /api/presentations/:id/select-topic
// @access  Public (Students)
const selectTopic = async (req, res) => {
  try {
    const { studentName, studentId, topicId } = req.body;
    const presentationId = req.params.id;

    if (!studentName || !studentId || !topicId) {
      return res.status(400).json({ message: 'Student Name, Student ID, and Topic selection are required.' });
    }

    const trimmedStudentName = studentName.trim();
    const trimmedStudentId = studentId.trim();

    // 1. Check Presentation exists and is published
    const presentation = await Presentation.findById(presentationId);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    if (presentation.status === 'draft') {
      return res.status(400).json({ message: 'This presentation is not published.' });
    }

    if (presentation.status === 'locked') {
      return res.status(400).json({ message: 'This presentation is currently locked. Topic selection is closed.' });
    }

    // 2. Enforce Duplicate Check: Student ID can select only ONE topic per presentation
    const existingStudentSelection = await Selection.findOne({
      presentationId,
      studentId: trimmedStudentId
    });

    if (existingStudentSelection) {
      return res.status(400).json({ message: 'You have already selected a topic for this presentation.' });
    }

    // 3. FCFS Atomic Reservation on MongoDB
    // Atomically find topic where status is 'available' and flip to 'selected'
    const updatedTopic = await Topic.findOneAndUpdate(
      {
        _id: topicId,
        presentationId: presentation._id,
        status: 'available'
      },
      {
        $set: { status: 'selected' }
      },
      {
        new: true
      }
    );

    if (!updatedTopic) {
      return res.status(409).json({
        message: 'Sorry, this topic has already been selected. Please choose another topic.'
      });
    }

    // 4. Create Selection Document
    try {
      const selection = await Selection.create({
        presentationId: presentation._id,
        topicId: updatedTopic._id,
        studentName: trimmedStudentName,
        studentId: trimmedStudentId,
        selectedAt: new Date()
      });

      return res.status(201).json({
        message: 'Topic Selected Successfully!',
        selection: {
          id: selection._id,
          studentName: selection.studentName,
          studentId: selection.studentId,
          topicTitle: updatedTopic.title,
          topicNumber: updatedTopic.topicNumber,
          selectedAt: selection.selectedAt,
          subjectCode: presentation.subjectCode,
          subjectName: presentation.subjectName,
          presentationDate: presentation.presentationDate
        }
      });
    } catch (createError) {
      // Rollback topic status if selection document fails (e.g. race condition hit unique index)
      await Topic.findByIdAndUpdate(topicId, { $set: { status: 'available' } });

      if (createError.code === 11000) {
        return res.status(400).json({
          message: 'You have already selected a topic for this presentation.'
        });
      }
      throw createError;
    }
  } catch (error) {
    console.error('selectTopic error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Get all selections for presentation results
// @route   GET /api/presentations/:id/selections
// @access  Private (Teacher)
const getPresentationSelections = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    const selections = await Selection.find({ presentationId: req.params.id })
      .populate('topicId', 'topicNumber title status')
      .sort({ selectedAt: 1 });

    const totalTopics = await Topic.countDocuments({ presentationId: req.params.id });
    const selectedCount = selections.length;
    const remainingCount = Math.max(0, totalTopics - selectedCount);

    const formattedSelections = selections.map(s => ({
      _id: s._id,
      studentName: s.studentName,
      studentId: s.studentId,
      topicId: s.topicId ? s.topicId._id : null,
      topicNumber: s.topicId ? s.topicId.topicNumber : null,
      topicTitle: s.topicId ? s.topicId.title : 'Deleted Topic',
      selectedAt: s.selectedAt
    }));

    return res.json({
      presentation: {
        _id: presentation._id,
        subjectCode: presentation.subjectCode,
        subjectName: presentation.subjectName,
        presentationDate: presentation.presentationDate,
        status: presentation.status,
        totalTopics: totalTopics || presentation.numberOfTopics,
        selectedTopics: selectedCount,
        remainingTopics: remainingCount
      },
      selections: formattedSelections
    });
  } catch (error) {
    console.error('getPresentationSelections error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Release / Repost a selected topic
// @route   DELETE /api/selections/:selectionId
// @access  Private (Teacher)
const releaseSelection = async (req, res) => {
  try {
    const selection = await Selection.findById(req.params.selectionId);
    if (!selection) {
      return res.status(404).json({ message: 'Selection record not found.' });
    }

    const topicId = selection.topicId;

    // Remove selection record
    await Selection.findByIdAndDelete(selection._id);

    // Atomically reset topic status to available
    if (topicId) {
      await Topic.findByIdAndUpdate(topicId, { $set: { status: 'available' } });
    }

    return res.json({ message: 'Topic released successfully and is now available for other students.' });
  } catch (error) {
    console.error('releaseSelection error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

module.exports = {
  getStudentPresentations,
  getStudentPresentationDetails,
  selectTopic,
  getPresentationSelections,
  releaseSelection
};
