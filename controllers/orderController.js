import {
    createOrder,
    getAllOrder,
    getOrderByID,
    getUserOrders
} from "../model/orderModel.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import { createClient } from 'redis';

dotenv.config();

const connection = await amqp.connect('amqp://localhost');
const channel = await connection.createChannel();
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

const createOrderController = async (req, res) => {
    try {
        const { items, total } = req.body;
        const decoded = jwt.verify(req.cookies.access_token, process.env.JWT_SECRET);

        const { id } = decoded || {};
        if (!id) {
            return res.status(401).json({ message: 'Unauthorized: Missing user id' });
        }

        const newOrder = await createOrder(id, items, total);
        if (newOrder) {

            await channel.assertQueue("queue1", {
                durable: true,
                arguments: {
                    'x-queue-type': 'quorum'
                }
            });

            // channel.sendToQueue("queue1", Buffer.from("New order created: " + JSON.stringify(newOrder)), {
            //     persistent: true
            // });

            // channel.sendToQueue("queue1", Buffer.from("User email: " + req.user.email), {
            //     persistent: true
            // });

            channel.sendToQueue(
                "queue1",
                Buffer.from(JSON.stringify({
                    event: "ORDER_CREATED",
                    data: {
                        order: JSON.stringify(newOrder),
                        email: req.user.email
                    }
                })),
                { persistent: true }
            );

            setTimeout(function () {
                connection.close();
                process.exit(0)
            }, 500);

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
    try {
        const cachedData = await client.get('orders');

        if (cachedData) {
            return res.status(200).json({ orders: JSON.parse(cachedData) });
        }
        const data = await getAllOrder();
        await client.set('orders', JSON.stringify(data), { EX: 3600 }); // Set expiration time to 1 hour
        res.status(200).json({ orders: data });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

const getOrderByIDController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await getOrderByID(id);
        if (data) {
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
    try {
        const { id } = req.user || {};
        const data = await getUserOrders(id);
        res.status(200).json({ orders: data });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Error fetching user orders' });
    }
};

export { createOrderController, getAllOrdersController, getOrderByIDController, getUserOrdersController };
