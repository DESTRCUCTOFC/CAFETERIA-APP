import { Router } from 'express';
import { db } from '../../config/firebase.js';
const router = Router();

router.get('/', async function(req, res) {
    const snapshot = await db.collection('orders').get();
    const orders = [];
    snapshot.forEach(function(doc) { orders.push(doc.data()); });
    res.json(orders);
});

router.post('/', async function(req, res) {
    await db.collection('orders').doc(req.body.id).set(req.body);
    res.json({ success: true });
});

export default router;