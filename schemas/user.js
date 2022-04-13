const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchema = new Schema({
    firstName: String,
    lastName: String,
    favorites: [String]
}, {
    collection: 'users'
})

module.exports = userSchema