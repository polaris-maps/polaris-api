const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    firstName: String,
    lastName: String,
    favoriteLocations: [String],
    issueInteractions: [String],
    issuesCreated:[String]
}, {
    collection: 'users'
})

module.exports = userSchema