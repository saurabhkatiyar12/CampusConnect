const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads', folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt|mp4|mp3/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error('File type not supported'), false);
};

const uploadAvatar = multer({ storage: createStorage('avatars'), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadAssignment = multer({ storage: createStorage('assignments'), fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
const uploadMaterial = multer({ storage: createStorage('materials'), fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });

module.exports = { uploadAvatar, uploadAssignment, uploadMaterial };
