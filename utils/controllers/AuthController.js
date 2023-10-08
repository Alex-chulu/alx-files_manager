// Import required modules and your Redis client
import { promisify } from 'util';
import { redisClient } from '../utils/redis';
import { sha1 } from 'sha1-async';
import { v4 as uuidv4 } from 'uuid';

// Sample user data for demonstration purposes
const users = [
  {
    id: 1,
    email: 'user1@example.com',
    password: '4a1f95d9707a7dd3605ae1f59075cd15a6efab02', // SHA1 of 'password1'
  },
  {
    id: 2,
    email: 'user2@example.com',
    password: 'd6a29ea9698d6ef3d4db0ea3cfcd8d7108f86df4', // SHA1 of 'password2'
  },
  // Add more user data here
];

// Helper function to find a user by email and password
function findUserByEmailAndPassword(email, password) {
  const hashedPassword = sha1(password); // Hash the provided password
  return users.find((user) => user.email === email && user.password === hashedPassword);
}

const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

const AuthController = {
  getConnect: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
      const email = credentials[0];
      const password = credentials[1];

      const user = findUserByEmailAndPassword(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4(); // Generate a random token
      const key = `auth_${token}`;
      await setAsync(key, user.id, 'EX', 86400); // Store the user ID in Redis for 24 hours

      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getDisconnect: async (req, res) => {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const key = `auth_${token}`;
      const userId = await getAsync(key);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await delAsync(key); // Delete the token from Redis

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default AuthController;

