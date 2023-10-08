import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
// Import required modules and database utilities
const bcrypt = require('bcrypt');
const { User } = require('../models'); // Replace with your actual database model

// Controller function to create a new user
const UsersController = {
  postNew: async (req, res) => {
    try {
      // Get email and password from the request body
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Check if the email already exists in the database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10); // You can adjust the number of rounds (salt) as needed

      // Create a new user in the database
      const newUser = new User({
        email,
        password: hashedPassword,
      });
      const user = { id: 'userId', email: 'user@example.com' };

      const job = await userQueue.add('sendWelcomeEmail', {
      userId: user.id,
      email: user.email,
      });
      await newUser.save();

      // Return the new user with minimal information (email and id)
      res.status(201).json({ id: newUser._id, email: newUser.email });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = UsersController;

