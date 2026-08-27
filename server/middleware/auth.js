const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const protectTeacher = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'jonita_mam_presentation_secret_key_2026'
      );

      req.teacher = await Teacher.findById(decoded.id).select('-passwordHash');
      if (!req.teacher) {
        return res.status(401).json({ message: 'Teacher account not found.' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

module.exports = { protectTeacher };
