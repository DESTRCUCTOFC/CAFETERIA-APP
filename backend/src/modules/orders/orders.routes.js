// src/modules/orders/orders.routes.js
import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus } from './orders.controller.js';

const router = Router();

// Define los endpoints relativos
router.get('/', getOrders);    // Responde a GET http://localhost:4000/api/orders
router.post('/', createOrder);  // Responde a POST http://localhost:4000/api/orders
router.patch('/:id/estado', updateOrderStatus);
export default router;