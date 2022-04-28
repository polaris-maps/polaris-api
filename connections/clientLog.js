const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const clientLogRecordSchema = require("../schemas/clientLog")

var conn = mongoose.createConnection(process.env.ATLAS_URI_LOGS);

var clientLogRecordConnection = conn.model('clientLogRecord', clientLogRecordSchema);

module.exports = clientLogRecordConnection