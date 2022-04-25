const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

var winston = require('winston');

/**
 * Requiring `winston-mongodb` will expose
 * `winston.transports.MongoDB`
 */
require('winston-mongodb');

winston.add(new winston.transports.MongoDB({
    level: 'info',
    db: process.env.ATLAS_URI_LOGS,
    options: { useUnifiedTopology: true },
    collection: 'access',
    metaKey: 'meta'
}));

// Taken with modification from https://stackoverflow.com/questions/55606854/how-to-use-express-winston-and-winston-mongodb-together
function logger(err, req, res, next) {
    let logdata = {
        remoteaddr: req.ip ?? null,
        remoteuser: req.user ?? null,
        time: Date.now() ?? null,
        method: req.method ?? null,
        url: req.url ?? null,
        protocol: req.protocol ?? null,
        httpversion: req.httpVersion ?? null,
        secure: req.secure.toString() ?? null, // TODO: is this ok?
        status: res.statusCode ?? null,
        referer: req.headers['referer'] ?? null,
        useragent: req.headers['user-agent'] ?? null
    }

    console.log(logdata)
    winston.info(logdata)
    // // Log the exception
    // winston.error({ message: err.message, level: err.level, stack: err.stack, meta: err })

    // res.status(500).send("Something failed..cannot connect to server");
};

module.exports = logger