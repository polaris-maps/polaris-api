const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const indoorIssueSchema = require("../schemas/indoorIssue")

var conn = mongoose.createConnection(process.env.ATLAS_URI_ISSUES);

var indoorIssueConnection = conn.model('indoorIssue', indoorIssueSchema);

module.exports = indoorIssueConnection