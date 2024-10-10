# Cloud File Manager with OAuth2 Authentication

## Project Overview
A cloud file management system that allows users to authenticate using OAuth2, manage files (upload, download, delete), organize them into folders.

## Features
- Google OAuth2 authentication
- Upload, download, delete files
- Download entire folder as ZIP
- Pagination and sorting for file lists
- Real-time notifications (via WebSocket)
- Cron job for cleaning up temporary files
- Cloud storage integration (Google Cloud Storage)

## Requirements
- Node.js v16+
- MongoDB Atlas or local MongoDB instance
- Google Cloud Platform account for storage


## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/chabikant/cloud-managment.git
   cd cloud-file-manager
2. Install dependencies:
   npm install
   
3. Set up your environment variables in a .env file:
   PORT=5000
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SENDGRID_API_KEY=your_sendgrid_api_key
GCS_BUCKET_NAME=your_gcs_bucket_name
GCS_PROJECT_ID=your_gcs_project_id
GCS_KEYFILE=path_to_your_gcs_service_account_key.json
SESSION_SECRET=your_secret_session_key

4.Run the application:
npm start
