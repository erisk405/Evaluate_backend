const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const memoryStorage = multer.memoryStorage();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'UserProfile', // เปลี่ยนเป็นชื่อโฟลเดอร์ที่ต้องการ
        // สามารถตั้งค่าให้เป็น 'png', 'jpeg', ฯลฯ
        format: async (req, file) => {
            const mimeType = file.mimetype;
            if (mimeType === 'image/png') {
                return 'png';
            } else {
                return 'jpeg';
            }
        },
        public_id: (req, file) => Date.now().toString() + '-' + file.originalname,
    },
});
const uploadImageToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'DepartmentImage' },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        uploadStream.end(file.buffer);
    });
};



const uploadDepartmentImage = multer({ storage: memoryStorage });
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
    uploadDepartmentImage,
    deleteImage,
    uploadImageToCloudinary
}