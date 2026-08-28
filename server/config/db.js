const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default faculty if not exists
    const teacherCount = await Teacher.countDocuments();

    if (teacherCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Jonita@104', salt);

      await Teacher.create({
        teacherId: 'Jonita_001',
        name: 'Jonita Mam',
        passwordHash: hashedPassword
      });

      console.log(
        'Default faculty account created: MCA_Teacher (Jonita Mam)'
      );
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;