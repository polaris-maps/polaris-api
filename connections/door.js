const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const doorSchema = require("../schemas/door")

var conn = mongoose.createConnection(process.env.ATLAS_URI_CAMPUSES);

var doorConnection = conn.model('door', doorSchema);

module.exports = doorConnection