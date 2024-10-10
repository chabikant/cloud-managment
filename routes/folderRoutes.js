const express = require('express');
const { createFolder, getFolderContents } = require('../controllers/folderController');
const router = express.Router();

// Create a new folder
router.post('/create', createFolder);

// Get contents of a folder
router.get('/:folderId', getFolderContents);

module.exports = router;
