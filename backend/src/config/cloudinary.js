import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});
console.log("☁️ Cloudinary cargado exitosamente para el cloud:", process.env.CLOUDINARY_NAME);

export default cloudinary;