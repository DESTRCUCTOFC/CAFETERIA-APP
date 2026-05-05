import { Router } from 'express';
import { login, registerStudent } from './auth.controller.js';

const router = Router();

// Esta ruta ahora sí recibirá el POST 
router.post('/login', login);

// Esta ruta servirá para crear usuarios 
router.post('/register', registerStudent);

export default router;