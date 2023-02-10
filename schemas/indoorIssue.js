const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var indoorIssueSchema = new Schema({
    location: String,
    category: String,
    description: String,
    status: String,
    datetimeOpen: Number,
    datetimeClosed: Number,
    datetimePermanent: Number,
    votes: [String]
}, {
    collection: 'indoorIssues'
})

module.exports = indoorIssueSchema