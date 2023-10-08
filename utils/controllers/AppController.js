// Import necessary modules and models
const mongoose = require('mongoose');
const User = require('../models/User'); // Import your user model
const File = require('../models/File'); // Import your file model

const AppController = {
  getStatus: async (req, res) => {
    // Check Redis and DB status here
    const redisStatus = true; // Replace with your Redis status check
    const dbStatus = mongoose.connection.readyState === 1; // 1 indicates connected to DB

    res.status(200).json({ redis: redisStatus, db: dbStatus });
  },

  getStats: async (req, res) => {
    try {
      // Fetch user count from the User model
      const userCount = await User.countDocuments();

      // Fetch file count from the File model
      const fileCount = await File.countDocuments();

      res.status(200).json({ users: userCount, files: fileCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = AppController;

