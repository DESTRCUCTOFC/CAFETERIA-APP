import { db } from '../../config/firebase.js';
import bcrypt from 'bcrypt';

// Correos autorizados para Staff (JP y AJ)
const STAFF_EMAILS = ['jp@uni.edu', 'aj@uni.edu','ale@uni.edu'];

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscamos el usuario en Firestore
        const userDoc = await db.collection('users').doc(email).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: "Usuario no encontrado. Regístrate primero." });
        }

        const userData = userDoc.data();

        // Comparamos la contraseña usando bcrypt
        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        //  el servidor devuelve el rol real guardado en la base de datos
        res.status(200).json({ 
            message: "Acceso exitoso", 
            user: { 
                email: userData.email, 
                name: userData.name, 
                role: userData.role 
            } 
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};

export const registerStudent = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        //solo se  asigna 'staff' si el correo está en la lista 
        const finalRole = STAFF_EMAILS.includes(email) ? 'staff' : 'student';

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.collection('users').doc(email).set({
            name,
            email,
            password: hashedPassword,
            role: finalRole, // Si no es jp o aj sera  estudaiante 
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar usuario" });
    }
};