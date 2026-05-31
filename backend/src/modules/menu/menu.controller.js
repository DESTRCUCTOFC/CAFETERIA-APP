import cloudinary from '../../config/cloudinary.js';
import { db } from '../../config/firebase.js';

// 1. FUNCIÓN PARA AGREGAR PLATILLO 
export const agregarElementoMenu = async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria } = req.body;
        let imagenUrl = "";

        if (req.file) {//Si tiene imagen ejecuta
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'cafeteria_app' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            imagenUrl = result.secure_url;
        }

        const nuevoElemento = {
            nombre,
            descripcion,
            precio: parseFloat(precio),
            categoria,
            imagenUrl,
            disponible: true, // por el moemento simepre  hay 
            createdAt: new Date()
        };

        const docRef = await db.collection('menu').add(nuevoElemento);
        res.status(201).json({ id: docRef.id, ...nuevoElemento });

    } catch (error) {
        res.status(500).json({ msg: "Hubo un error al crear el platillo", error: error.message });
    }
};

// 2. FUNCIÓN PARA VER EL MENÚ 
export const obtenerMenu = async (req, res) => {
    try {
        const resultado = await db.collection('menu').orderBy('createdAt', 'desc').get();
        const menu = resultado.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(menu);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener el menú", error: error.message });
    }
};

// 3.  PARA MARCAR COMO AGOTADO 
export const actualizarDisponibilidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { disponible } = req.body;

        await db.collection('menu').doc(id).update({ disponible });

        res.status(200).json({ msg: "Estado de disponibilidad actualizado" });
    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar estado", error: error.message });
    }
};

export const actualizarPrecio = async (req, res) => {
    try {
        const { id } = req.params;
        const { precio } = req.body;
        
        if (!precio || isNaN(precio) || precio <= 0) {
            return res.status(400).json({ msg: "Precio inválido" });
        }
        
        await db.collection('menu').doc(id).update({ precio });
        res.status(200).json({ msg: "Precio actualizado" });
    } catch (error) {
        console.error("Error en actualizarPrecio:", error);
        res.status(500).json({ msg: error.message });
    }
};

export const eliminarPlatillo = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('menu').doc(id).delete();
        res.status(200).json({ msg: "Platillo eliminado" });
    } catch (error) {
        console.error("Error en eliminarPlatillo:", error);
        res.status(500).json({ msg: error.message });
    }
};