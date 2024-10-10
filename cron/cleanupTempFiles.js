const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Temporary folder path
const tempFolderPath = path.join(__dirname, '../temp');

// Function to delete files older than 1 hour
const deleteOldFiles = () => {
    const now = Date.now();
    const threshold = 60 * 60 * 1000; // 1 hour in milliseconds

    fs.readdir(tempFolderPath, (err, files) => {
        if (err) {
            console.error('Error reading temp folder:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(tempFolderPath, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                // If the file is older than 1 hour, delete it
                if ((now - stats.mtimeMs) > threshold) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file ${file}:`, err);
                        } else {
                            console.log(`Deleted old file: ${file}`);
                        }
                    });
                }
            });
        });
    });
};

// Schedule the cleanup job to run every hour
cron.schedule('0 * * * *', () => {
    console.log('Running temp file cleanup cron job');
    deleteOldFiles();
});
