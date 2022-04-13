const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
const mongoose = require("mongoose");

const userSchema = require("../schemas/user")

var conn = mongoose.createConnection(process.env.ATLAS_URI_LOGIN);

var userConnection = conn.model('user', userSchema);

module.exports = userConnection