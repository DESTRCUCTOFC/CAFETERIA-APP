// src/modules/orders/orders.controller.js
import { db } from '../../config/firebase.js'; // Ajusta la ruta a donde tengas configurado Firebase Admin

// 1. OBTENER TODAS LAS ÓRDENES (Para el monitor de la cocina)
export const getOrders = async (req, res) => {
    try {
        const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
        const ordenes = [];

        snapshot.forEach(doc => {
            ordenes.push({ id: doc.id, ...doc.data() });
        });

        // CRÍTICO: Esto es lo que saca al frontend del estado "Cargando..."
        return res.status(200).json(ordenes);
    } catch (error) {
        console.error("Error al obtener órdenes en el controlador:", error);
        return res.status(500).json({ success: false, message: "Error al obtener las órdenes" });
    }
};

// 2. CREAR UNA NUEVA ÓRDEN (Para el checkout de estudiantes)
export const createOrder = async (req, res) => {
    try {
        const nuevaOrden = req.body;

        // Añadimos estampa de tiempo del servidor por seguridad si no viene
        if (!nuevaOrden.createdAt) {
            nuevaOrden.createdAt = new Date().toISOString();
        }

        const docRef = await db.collection('orders').add(nuevaOrden);

        return res.status(201).json({
            success: true,
            message: "Orden guardada con éxito en la cocina",
            id: docRef.id
        });
    } catch (error) {
        console.error("Error al crear orden en el controlador:", error);
        return res.status(500).json({ success: false, message: "Error al procesar la orden" });
    }
};
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // ID del documento de Firestore (ej: TBm0LG5z7VUSCzYcDGtv)

        // CORRECCIÓN 1: Aceptamos tanto 'status' como 'estado' del body para evitar fallos
        const nuevoEstado = req.body.status || req.body.estado;

        if (!nuevoEstado) {
            return res.status(400).json({ success: false, message: "El estado/status es requerido" });
        }

        // CORRECCIÓN 2: Buscamos e intentamos actualizar directamente el documento usando su ID real
        const orderRef = db.collection('orders').doc(id);
        const doc = await orderRef.get();

        // Si no existe con el ID de documento, hacemos un fallback por si acaso quedan órdenes viejas con el campo personalizado 'id'
        if (!doc.exists) {
            const snapshot = await db.collection('orders').where('id', '==', id).limit(1).get();

            if (snapshot.empty) {
                return res.status(404).json({ success: false, message: "Orden no encontrada en el sistema" });
            }

            // Si se encontró de forma vieja, actualizamos ese documento
            const oldDocId = snapshot.docs[0].id;
            await db.collection('orders').doc(oldDocId).update({
                status: nuevoEstado
            });
        } else {
            // Camino óptimo para tus órdenes nuevas: actualiza directo
            await orderRef.update({
                status: nuevoEstado
            });
        }

        return res.status(200).json({
            success: true,
            message: `Orden ${id} actualizada con éxito a: ${nuevoEstado}`
        });

    } catch (error) {
        console.error("Error al actualizar estado de la orden:", error);
        return res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};