const router = require('express').Router();
const { getMaterials, uploadMaterial, deleteMaterial } = require('../controllers/material.controller');
const { protect, requireRole } = require('../middleware/auth');
const { uploadMaterial: multerUpload } = require('../middleware/upload');

router.get('/', protect, getMaterials);
router.post('/', protect, requireRole('faculty', 'admin'), multerUpload.array('files', 10), uploadMaterial);
router.delete('/:id', protect, requireRole('faculty', 'admin'), deleteMaterial);

module.exports = router;
