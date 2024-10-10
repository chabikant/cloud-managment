const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { uploadFileToGCS } = require('../services/googleCloudStorage');
const File = require('../models/File');

// Multer setup to handle file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // limit file size to 10MB
}).single('file');

exports.getFiles = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'name' } = req.query;

        // Skip and limit for pagination
        const skip = (page - 1) * limit;
        const files = await File.find()
            .sort({ [sortBy]: 1 }) // Sort by specified field
            .skip(skip)
            .limit(parseInt(limit));

        // Get the total count of files for pagination
        const totalFiles = await File.countDocuments();

        res.status(200).json({
            files,
            totalPages: Math.ceil(totalFiles / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching files' });
    }
};


// Upload file to GCS and save metadata in MongoDB
exports.uploadFile = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload failed' });
        }

        try {
            // Upload file to Google Cloud Storage
            const publicUrl = await uploadFileToGCS(req.file);

            // Save file metadata to MongoDB
            const file = new File({
                name: req.file.originalname,
                url: publicUrl,
                size: req.file.size,
                folder: req.body.folder || null
            });
            await file.save();

            // Emit a file upload event through Socket.io
            io.emit('fileUploaded', { message: 'File uploaded successfully', file });

            res.status(200).json({ message: 'File uploaded successfully', file });
        } catch (error) {
            res.status(500).json({ error: 'Error uploading file' });
        }
    });
};


// Download a single file
exports.downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Emit a file download event
        io.emit('fileDownloaded', { message: 'File download started', file });

        // Redirect to the file's public URL in Google Cloud Storage
        res.redirect(file.url);
    } catch (error) {
        res.status(500).json({ error: 'Error downloading file' });
    }
};


// Download a folder as a ZIP
exports.downloadFolder = async (req, res) => {
    try {
        const folderId = req.params.folderId;
        
        // Find folder and its contents
        const folder = await Folder.findById(folderId);
        const files = await File.find({ folder: folderId });

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Create a temporary zip file in the server's filesystem
        const zipFilePath = path.join(__dirname, `../temp/${folder.name}.zip`);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);

        // Add files to the zip archive
        for (const file of files) {
            archive.append(file.name, { name: file.name });
        }

        archive.finalize();

        // When the zip file is ready, send it as a download
        output.on('close', () => {
            res.download(zipFilePath, `${folder.name}.zip`, (err) => {
                if (err) {
                    console.log('Error during download:', err);
                }
                // Clean up the zip file after download
                fs.unlinkSync(zipFilePath);
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error downloading folder' });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findByIdAndDelete(req.params.fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Emit a file deletion event
        io.emit('fileDeleted', { message: 'File deleted', file });

        // Delete file from Google Cloud Storage (not shown here, just metadata is deleted)
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting file' });
    }
};



