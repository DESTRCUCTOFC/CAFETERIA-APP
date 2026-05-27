import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});
console.log("☁️ Cloudinary cargado exitosamente para el cloud:", process.env.CLOUDINARY_CLOUD_NAME);

export default cloudinary;