const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var clientLogRecordSchema = new Schema({
    level: Number,
    additional: [String],
    message: String,
    timestamp: String,
    fileName: String,
    lineNumber: Number,
    columnNumber: Number,
    levelName: String
}, {
    collection: 'client'
})

module.exports = clientLogRecordSchema