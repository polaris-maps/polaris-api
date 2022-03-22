const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let Issue = new Schema({
    location: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String
    },
    datetimeOpen: {
        type: String
    },
    datetimeClosed: {
        type: String
    },
    datetimePermanent: {
        type: String
    },
    votes: {
        type: Number
    }
}, {
    collection: 'issues'
})
module.exports = mongoose.model('issue', Issue);