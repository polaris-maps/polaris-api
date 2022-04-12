const mongoose = require('mongoose')
const Schema = mongoose.Schema
var schema = {}

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

var User = new Schema({
    firstName: String,
    lastName: String,
    favoriteLocations: [String]
})

schema.Issue = mongoose.model('Issue', Issue)
schema.User = mongoose.model('User', User)

module.exports = schema