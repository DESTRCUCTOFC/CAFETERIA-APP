import express from 'express';
import { pay } from './payments.controller.js';

const router = express.Router();
router.post('/create-intent', pay);

export default router;