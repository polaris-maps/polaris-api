const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

// Taken with modification from:
// https://stackoverflow.com/questions/13941957/unable-to-save-logs-to-mongodb-database-for-winston-nodejs
// https://stackoverflow.com/questions/55606854/how-to-use-express-winston-and-winston-mongodb-together

const { createLogger, format, transports } = require('winston');
require('winston-mongodb');  // expose `winston.transports.MongoDB`

logger = createLogger({
    transports: [

        // File transport
        new transports.File({
            filename: 'winstonLogs.log',
            format: format.combine(
                format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                format.align(),
                format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            )
        }),
        new transports.MongoDB({
            level: 'info',
            db: process.env.ATLAS_URI_LOGS,
            options: {
                useUnifiedTopology: true,
            },
            collection: 'server_logs',
            format: format.combine(
                format.timestamp(),
                //convert logs to a json format for mongodb
                format.json()
            )
        })
    ]
})

function loggerFunction(req, res, next) {
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

    // logger.log('info', logdata);
    logger.log('info', logdata.toString());
}

// loggerFunction = function () {
//     logger.log('info', "Running logs ");
// }

module.exports = loggerFunction;