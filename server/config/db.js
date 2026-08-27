const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/presentation_topic_system');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default faculty if not exists
    const teacherCount = await Teacher.countDocuments();
    if (teacherCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Kishan@104', salt);
      await Teacher.create({
        teacherId: 'MCA_Teacher',
        name: 'Jonita Mam',
        passwordHash: hashedPassword
      });
      console.log('Default faculty account created: MCA_Teacher (Jonita Mam)');
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
