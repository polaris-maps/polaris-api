const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var User = new Schema({
    firstName: String,
    lastName: String,
    favorites: [String]
}, {
    collection: 'users'
})

module.exports = mongoose.model('user', User)