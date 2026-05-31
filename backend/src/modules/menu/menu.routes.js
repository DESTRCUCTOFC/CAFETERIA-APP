import express from 'express';
import * as menuController from './menu.controller.js';
import { upload } from './menu.middleware.js';

const router = express.Router();

router.get('/', menuController.obtenerMenu);
router.patch('/:id/disponibilidad', menuController.actualizarDisponibilidad);
router.post('/', upload.single('imagen'), menuController.agregarElementoMenu);
router.patch('/:id/precio', menuController.actualizarPrecio);
router.delete('/:id', menuController.eliminarPlatillo);

export default router;