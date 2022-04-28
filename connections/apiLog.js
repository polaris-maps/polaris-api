const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const apiLogSchema = require("../schemas/apiLog")

var conn = mongoose.createConnection(process.env.ATLAS_URI_LOGS);

var apiLogConnection = conn.model('apiLog', apiLogSchema);

module.exports = apiLogConnection