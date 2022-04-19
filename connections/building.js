const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const buildingSchema = require("../schemas/building")

var conn = mongoose.createConnection(process.env.ATLAS_URI_CAMPUSES);

var buildingConnection = conn.model('campus', buildingSchema);

module.exports = buildingConnection