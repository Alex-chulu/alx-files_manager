import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const router = Router();

// Define routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Routes for users
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// authentication of routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

export default router;
