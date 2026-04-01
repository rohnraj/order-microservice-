import Pool from "../config/db.js";
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (userId, items, total) => {

    const id = uuidv4();
    const query = 'INSERT INTO orders (id, user_id, items, total_amount) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [id, userId, {...items}, Number(total)];
    try {
        const rowData = await Pool.query(query, values);
        return rowData.rows[0];
    } catch (error) {
        console.error('Error creating order11:', error);
        throw error;
    }  
};

export const getAllOrder = async () => {
    const query = 'SELECT * FROM orders';
    try {
        const rowData = await Pool.query(query);
        return rowData.rows;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }           
};

export const getOrderByID = async (id) => {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const values = [id];
    try {
        const rowData = await Pool.query(query, values);
        return rowData.rows[0];
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }           
};

export const getUserOrders = async (userId) => {
    const query = 'SELECT * FROM orders WHERE user_id = $1';
    const values = [userId];
    try {
        const rowData = await Pool.query(query, values);
        return rowData.rows;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw error;
    }           
};