const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const issueSchema = require("../schemas/issue")

var conn = mongoose.createConnection(process.env.ATLAS_URI_ISSUES);

var issueConnection = conn.model('issue', issueSchema);

module.exports = issueConnection