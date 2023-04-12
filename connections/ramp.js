const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const rampSchema = require("../schemas/ramp")

var conn = mongoose.createConnection(process.env.ATLAS_URI_CAMPUSES);

var rampConnection = conn.model('ramp', rampSchema);

module.exports = rampConnection