const Folder = require('../models/Folder');
const File = require('../models/File');

// Create a new folder
exports.createFolder = async (req, res) => {
    const { name, parentFolder } = req.body;

    try {
        const folder = new Folder({
            name,
            parentFolder: parentFolder || null
        });
        await folder.save();

        res.status(201).json({ message: 'Folder created successfully', folder });
    } catch (error) {
        res.status(500).json({ error: 'Error creating folder' });
    }
};

// Get folder contents (files and subfolders)
exports.getFolderContents = async (req, res) => {
    const { folderId } = req.params;

    try {
        // Fetch subfolders and files in the current folder
        const folders = await Folder.find({ parentFolder: folderId });
        const files = await File.find({ folder: folderId });

        res.status(200).json({ folders, files });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching folder contents' });
    }
};
