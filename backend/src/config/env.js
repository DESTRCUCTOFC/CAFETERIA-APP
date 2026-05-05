import 'dotenv/config';

export const env = {
    PORT: process.env.PORT || 3000,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    // Aquí se agregaradespués las de JWT para el login
};

// Validación
const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
];

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`❌ Error: La variable de entorno ${key} es obligatoria en el .env`);
    }
}