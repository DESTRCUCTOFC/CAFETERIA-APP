import express from 'express';
import * as menuController from './menu.controller.js';
import { upload } from './menu.middleware.js';

const router = express.Router();

router.get('/', menuController.obtenerMenu);
router.patch('/:id/disponibilidad', menuController.actualizarDisponibilidad);
router.post('/', upload.single('imagen'), menuController.agregarElementoMenu);

export default router;