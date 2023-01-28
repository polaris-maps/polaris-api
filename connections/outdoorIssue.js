const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const outdoorIssueSchema = require("../schemas/outdoorIssue")

var conn = mongoose.createConnection(process.env.ATLAS_URI_ISSUES);

var outdoorIssueConnection = conn.model('outdoorIssue', outdoorIssueSchema);

module.exports = outdoorIssueConnection