const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Issue = new Schema({
    location: String,
    latitude: Number,
    longitude: Number,
    description: String,
    status: String,
    datetimeOpen: Number,
    datetimeClosed: Number,
    datetimePermanent: Number,
    votes: Number
}, {
    collection: 'issues'
})

module.exports = mongoose.model('issue', Issue)