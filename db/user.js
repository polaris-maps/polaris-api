const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var User = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    favorites: {
        type: [String]
    }
}, {
    collection: 'users'
})

module.exports = mongoose.model('user', User)