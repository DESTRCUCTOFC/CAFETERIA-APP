// src/modules/orders/orders.routes.js
import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus, deleteOrder } from './orders.controller.js';

const router = Router();

// Define los endpoints relativos
router.get('/', getOrders);    
router.post('/', createOrder); 
router.patch('/:id/estado', updateOrderStatus);
router.delete('/:id', deleteOrder);  

export default router;