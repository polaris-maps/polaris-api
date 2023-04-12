const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var rampSchema = new Schema({
    latitude: Number,
    longitude: Number,
    building: {
        type: Schema.Types.ObjectId, 
        ref: 'buildings'
    }
}, {
    collection: 'ramps'
})

module.exports = rampSchema