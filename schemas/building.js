const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var buildingSchema = new Schema({
    name: String,
    abbreviation: String,
    defaultLatitude: Number,
    defaultLongitude: Number,
    campus: String
}, {
    collection: 'buildings'
})

module.exports = buildingSchema