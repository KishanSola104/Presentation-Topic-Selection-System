const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Auth teacher & get token
// @route   POST /api/auth/login
// @access  Public
const loginTeacher = async (req, res) => {
  try {
    const { teacherId, password } = req.body;

    if (!teacherId || !password) {
      return res.status(400).json({
        message: 'Invalid faculty ID or password.'
      });
    }

    const teacher = await Teacher.findOne({
      teacherId: teacherId.trim()
    });

    if (!teacher) {
      return res.status(401).json({
        message: 'Invalid faculty ID or password.'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      teacher.passwordHash
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid faculty ID or password.'
      });
    }

    const token = generateToken(teacher._id);

    return res.json({
      token,
      teacher: {
        id: teacher._id,
        teacherId: teacher.teacherId,
        name: teacher.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
};

// @desc    Get current logged in teacher
// @route   GET /api/auth/me
// @access  Private (Teacher)
const getMe = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher._id)
      .select('-passwordHash');

    if (!teacher) {
      return res.status(404).json({
        message: 'Faculty not found.'
      });
    }

    return res.json({
      teacher: {
        id: teacher._id,
        teacherId: teacher.teacherId,
        name: teacher.name
      }
    });
  } catch (error) {
    console.error('getMe error:', error);

    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
};

module.exports = {
  loginTeacher,
  getMe
};