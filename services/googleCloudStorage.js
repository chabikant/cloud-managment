const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Google Cloud Storage

const storage = new Storage({
    keyFilename: process.env.GCS_KEYFILE,
    projectId: process.env.GCS_PROJECT_ID
});
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);


// Function to upload file to Google Cloud Storage

const uploadFileToGCS = (file) => {
    return new Promise((resolve, reject) => {
        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', () => {
            // File upload successful
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        });

        blobStream.end(file.buffer);
    });
};

module.exports = { uploadFileToGCS };
