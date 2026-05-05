import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { db } from './config/firebase.js'; 
import authRoutes from './modules/auth/auth.routes.js'; 

const app = express();

app.use(cors());           
app.use(express.json());   

// CONECTA LAS RUTAS CON EL PREFIJO /api/auth
app.use('/api/auth', authRoutes);

// PRUEBA 
app.get('/', (req, res) => {
    res.json({ 
        mensaje: "API Cafetería Uni - Proyecto",
        estado: "Online",
        estudiante: "Juan Pablo" 
    });
});

// VERIFICACIÓN DE LA BASE DE DATOS
const checkDatabase = async () => {
    try {
        await db.collection('users').limit(1).get();
        console.log(" 📚Conexión exitosa a Firestore (Colección: users)");
    } catch (error) {
        console.error("😩Error de conexión a Firebase", error.message);
    }
};

checkDatabase();

// ENCENDIDO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
});