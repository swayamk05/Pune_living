const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with the credentials from your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure the storage engine for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // Specify the folder in Cloudinary where you want to store your images
        folder: 'Wanderlust_dev',
        // Specify the allowed image formats
        allowedFormats: ['jpeg', 'png', 'jpg'],
    },
});

// Export the configured cloudinary object and storage engine
module.exports = {
    cloudinary,
    storage,
};

