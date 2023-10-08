const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController'); // Import UsersController

// Define API endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Add the new POST endpoint for creating users
router.post('/users', UsersController.postNew);

module.exports = router;

