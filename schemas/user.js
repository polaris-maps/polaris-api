const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    favoriteLocations: [String],
    indoorIssueInteractions: [String],
    indoorIssuesCreated:[String]
}, {
    collection: 'users'
})

module.exports = userSchema