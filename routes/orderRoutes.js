import express from 'express';
import { createOrderController, getAllOrdersController, getOrderByIDController, getUserOrdersController } from '../controllers/orderController.js';
import { verifyUser, refreshAccessToken } from '../middleware/orderMiddleware.js';

const router = express.Router();

router.post('/create', refreshAccessToken, verifyUser, createOrderController);
router.get('/all', refreshAccessToken, verifyUser, getAllOrdersController);
router.get('/:id', refreshAccessToken, verifyUser, getOrderByIDController);
router.get('/user/:userId', refreshAccessToken, verifyUser, getUserOrdersController);

export default router;

