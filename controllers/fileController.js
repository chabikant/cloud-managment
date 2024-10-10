const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { uploadFileToGCS } = require('../services/googleCloudStorage');
const File = require('../models/File');

// Multer setup 
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // limit file size to 10MB
}).single('file');

exports.getFiles = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'name' } = req.query;

        // pagination
        const skip = (page - 1) * limit;
        const files = await File.find()
            .sort({ [sortBy]: 1 }) 
            .skip(skip)
            .limit(parseInt(limit));

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
            
            const publicUrl = await uploadFileToGCS(req.file);

               const file = new File({
                name: req.file.originalname,
                url: publicUrl,
                size: req.file.size,
                folder: req.body.folder || null
            });
            await file.save();

            
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


        io.emit('fileDownloaded', { message: 'File download started', file });

        res.redirect(file.url);
    } catch (error) {
        res.status(500).json({ error: 'Error downloading file' });
    }
};


// Download a folder as a ZIP
exports.downloadFolder = async (req, res) => {
    try {
        const folderId = req.params.folderId;
        
        const folder = await Folder.findById(folderId);
        const files = await File.find({ folder: folderId });

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        const zipFilePath = path.join(__dirname, `../temp/${folder.name}.zip`);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);

        for (const file of files) {
            archive.append(file.name, { name: file.name });
        }

        archive.finalize();

        output.on('close', () => {
            res.download(zipFilePath, `${folder.name}.zip`, (err) => {
                if (err) {
                    console.log('Error during download:', err);
                }
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

        io.emit('fileDeleted', { message: 'File deleted', file });

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting file' });
    }
};



