const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const campusSchema = require("../schemas/campus")

var conn = mongoose.createConnection(process.env.ATLAS_URI_CAMPUSES);

var campusConnection = conn.model('campus', campusSchema);

module.exports = campusConnection