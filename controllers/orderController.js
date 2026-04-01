import {
    createOrder,
    getAllOrder,
    getOrderByID,
    getUserOrders
} from "../model/orderModel.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const createOrderController = async (req, res) => {
    try {
        const { items, total } = req.body;
        const decoded = jwt.verify(req.cookies.access_token, process.env.JWT_SECRET);

        const { id } = decoded || {};
        if (!id) {
            return res.status(401).json({ message: 'Unauthorized: Missing user id' });
        }

        const newOrder = await createOrder(id, items, total);
        if(newOrder) {
            res.status(201).json({ message: 'Order created successfully', order: newOrder });
        } else {
            res.status(400).json({ message: 'Failed to create order' });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

const getAllOrdersController = async (req, res) => {
    try{
        const data = await getAllOrder();
        res.status(200).json({ orders: data });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

const getOrderByIDController = async (req, res) => {
    try{
        const { id } = req.params;
        const data = await getOrderByID(id);
        if(data) {
            res.status(200).json({ order: data });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }   
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order' });
    }
};

const getUserOrdersController = async (req, res) => {
    try{
        const { id } = req.user || {};
        const data = await getUserOrders(id);
        res.status(200).json({ orders: data });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Error fetching user orders' });
    }
};

export { createOrderController, getAllOrdersController, getOrderByIDController, getUserOrdersController };
