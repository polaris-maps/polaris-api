// May be implemented in the future

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var locationSchema = new Schema({
    name: String,
    abbreviation: String,
    defaultLatitude: Number,
    defaultLongitude: Number,
    campus: String
}, {
    collection: 'locations'
})

module.exports = locationSchema