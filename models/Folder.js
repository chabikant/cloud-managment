const mongoose = require('mongoose');
const { Schema } = mongoose;

const folderSchema = new Schema({
    name: { type: String, required: true },
    parentFolder: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Folder', folderSchema);
