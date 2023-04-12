const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var doorSchema = new Schema({
    latitude: Number,
    longitude: Number,
    building: {
        type: Schema.Types.ObjectId, 
        ref: 'buildings'
    },
    automatic: Boolean,
    entrance: Boolean,
    attributes: String
}, {
    collection: 'doors'
})

module.exports = doorSchema