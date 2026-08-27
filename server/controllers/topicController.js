const Topic = require('../models/Topic');
const Presentation = require('../models/Presentation');
const Selection = require('../models/Selection');

// @desc    Get topics for a presentation
// @route   GET /api/presentations/:id/topics
// @access  Public / Private
const getTopicsByPresentation = async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    const topics = await Topic.find({ presentationId: req.params.id }).sort({ topicNumber: 1 });
    return res.json(topics);
  } catch (error) {
    console.error('getTopicsByPresentation error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Bulk save / update topics for a presentation
// @route   POST /api/presentations/:id/topics
// @access  Private (Teacher)
const savePresentationTopics = async (req, res) => {
  try {
    const { topics } = req.body; // Array of { _id, topicNumber, title }
    const presentationId = req.params.id;

    const presentation = await Presentation.findById(presentationId);
    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found.' });
    }

    if (presentation.status === 'locked') {
      return res.status(400).json({ message: 'Cannot edit topics of a locked presentation. Unlock first.' });
    }

    if (!Array.isArray(topics)) {
      return res.status(400).json({ message: 'Topics must be an array.' });
    }

    const existingTopics = await Topic.find({ presentationId }).sort({ topicNumber: 1 });
    const updatedTopicIds = [];

    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      const topicNumber = t.topicNumber || i + 1;
      const title = t.title ? t.title.trim() : '';

      let topicDoc = null;
      if (t._id) {
        topicDoc = await Topic.findById(t._id);
      } else if (existingTopics[i]) {
        topicDoc = existingTopics[i];
      }

      if (topicDoc) {
        topicDoc.topicNumber = topicNumber;
        topicDoc.title = title;
        await topicDoc.save();
        updatedTopicIds.push(topicDoc._id);
      } else {
        const newDoc = await Topic.create({
          presentationId,
          topicNumber,
          title,
          status: 'available'
        });
        updatedTopicIds.push(newDoc._id);
      }
    }

    // Delete any extra unselected placeholder topics
    for (const ext of existingTopics) {
      if (!updatedTopicIds.some(id => id.equals(ext._id))) {
        if (ext.status !== 'selected') {
          await Topic.findByIdAndDelete(ext._id);
        }
      }
    }

    // Update numberOfTopics in presentation
    const totalCount = await Topic.countDocuments({ presentationId });
    presentation.numberOfTopics = totalCount;
    await presentation.save();

    const finalTopics = await Topic.find({ presentationId }).sort({ topicNumber: 1 });
    return res.json({ message: 'Topics saved successfully.', topics: finalTopics });
  } catch (error) {
    console.error('savePresentationTopics error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Update single topic
// @route   PUT /api/topics/:topicId
// @access  Private (Teacher)
const updateTopic = async (req, res) => {
  try {
    const { title } = req.body;
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    topic.title = title !== undefined ? title.trim() : topic.title;
    await topic.save();

    return res.json(topic);
  } catch (error) {
    console.error('updateTopic error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Delete single topic
// @route   DELETE /api/topics/:topicId
// @access  Private (Teacher)
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    if (topic.status === 'selected') {
      return res.status(400).json({
        message: 'Cannot delete a topic that has already been selected by a student. Release the topic first.'
      });
    }

    const presentationId = topic.presentationId;
    await Topic.findByIdAndDelete(topic._id);

    // Reorder remaining topics
    const remainingTopics = await Topic.find({ presentationId }).sort({ topicNumber: 1 });
    for (let i = 0; i < remainingTopics.length; i++) {
      remainingTopics[i].topicNumber = i + 1;
      await remainingTopics[i].save();
    }

    // Update presentation numberOfTopics
    await Presentation.findByIdAndUpdate(presentationId, {
      numberOfTopics: remainingTopics.length
    });

    return res.json({ message: 'Topic deleted successfully.', remainingTopics });
  } catch (error) {
    console.error('deleteTopic error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

module.exports = {
  getTopicsByPresentation,
  savePresentationTopics,
  updateTopic,
  deleteTopic
};
