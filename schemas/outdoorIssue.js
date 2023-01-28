const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var outdoorIssueSchema = new Schema({
    avoidPolygon: [[Number]],
    description: String,
    status: String,
    datetimeOpen: Number,
    datetimeClosed: Number,
    datetimePermanent: Number,
    votes: [String]
}, {
    collection: 'outdoorIssues'
})

module.exports = outdoorIssueSchema