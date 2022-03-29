const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Issue = new Schema({
    location: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    description: {
        type: String
    },
    status: {
        type: String
    },
    datetimeOpen: {
        type: Number
    },
    datetimeClosed: {
        type: Number
    },
    datetimePermanent: {
        type: Number
    },
    votes: {
        type: Number
    }
}, {
    collection: 'issues'
})

module.exports = mongoose.model('issue', Issue)