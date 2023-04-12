const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var doorSchema = new Schema({
    latitude: Number,
    longitude: Number,
    building: {
        type: Schema.Types.ObjectId, 
        ref: 'buildings'
    },
    ramps: [{
        type: Schema.Types.ObjectId, 
        ref: 'ramps'
    }],
    automatic: Boolean,
    stairs: Boolean,
    entrance: Boolean,
    emergency: Boolean
}, {
    collection: 'doors'
})

module.exports = doorSchema