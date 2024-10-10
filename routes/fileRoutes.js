const express = require('express');
const { uploadFile } = require('../controllers/fileController');
const router = express.Router();


// Get file
router.get('/files', fileController.getFiles);


// Upload file
router.post('/upload', uploadFile);

// Download single file
router.get('/download/:fileId', downloadFile);

// Download entire folder as ZIP
router.get('/download-folder/:folderId', downloadFolder);

module.exports = router;
