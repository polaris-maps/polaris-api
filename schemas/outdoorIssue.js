const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var outdoorIssueSchema = new Schema({
    avoidPolygon: {
        type: [[Number]],
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    category: {
        type: [String],
        validate: {
            validator: function (array) {
                return array.length > 0;
            },
            message: 'Category array must not be empty.',
        },
        required: true,
    },
    description: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 255,
        required: true,
    },
    status: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 100,
        required: true,
    },
    datetimeOpen: {
        type: Number,
        required: true,
    },
    datetimeClosed: {
        type: Number,
        required: true,
    },
    datetimePermanent: {
        type: Number,
        required: true,
    },
    votes: {
        type: [String],
        required: true,
    }
}, {
    collection: 'outdoorIssues'
})

module.exports = outdoorIssueSchema