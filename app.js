require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const socketIo = require('socket.io');
const http = require('http');
const app = express();




// Initialize DB connection

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));



require('./config/passport');
require('./cron/cleanupTempFiles');

// Session setup

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl:process.env.MONGODB_URI })
}));

// Passport middleware

app.use(passport.initialize());
app.use(passport.session());

// Body parser

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

app.use('/auth', require('./routes/authRoutes'));
app.use('/files', require('./routes/fileRoutes'));
app.use('/folders', require('./routes/folderRoutes'));


const server = http.createServer(app);
const io = socketIo(server);


// Socket.io connection

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for file upload notifications
    socket.on('fileUpload', (data) => {
        console.log('File upload completed:', data);
        io.emit('fileUploaded', data);
    });

    // Listen for file download notifications
    socket.on('fileDownload', (data) => {
        console.log('File download started:', data);
        io.emit('fileDownloaded', data);
    });

    // Listen for file/folder deletion notifications
    socket.on('fileDelete', (data) => {
        console.log('File or folder deleted:', data);
        io.emit('fileDeleted', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


const port= process.env.PORT
server.listen(port, () => console.log(`Server running on port ${port}`));
