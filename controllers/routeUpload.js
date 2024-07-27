const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'UserProfile', // เปลี่ยนเป็นชื่อโฟลเดอร์ที่ต้องการ
        format: async (req, file) => 'jpeg', // สามารถตั้งค่าให้เป็น 'png', 'jpeg', ฯลฯ
        public_id: (req, file) => Date.now().toString() + '-' + file.originalname,
    },
});

const upload = multer({ storage: storage });



async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image success: ${result}`);
    } catch (error) {
        console.error('Error deleting image:', error);
    }
}

module.exports = {
    upload,
    deleteImage
}