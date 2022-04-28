const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var apiLogSchema = new Schema({
    timestamp: Number,
    level: String,
    message: String,
    meta: Object
}, {
    collection: 'api'
})

module.exports = apiLogSchema