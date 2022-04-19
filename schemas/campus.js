const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var campusSchema = new Schema({
    name: String,
    buildings: [String]
}, {
    collection: 'campuses'
})

module.exports = campusSchema