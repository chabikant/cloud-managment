const mongoose = require('mongoose');
const { Schema } = mongoose;

const fileSchema = new Schema({
    name: String,
    url: String,
    size: Number,
    folder: { type: String, default: null }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);
