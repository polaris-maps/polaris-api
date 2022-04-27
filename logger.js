const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

// var winston = require('winston');

const { createLogger, format, transports } = require('winston');
require('winston-mongodb');  // expose `winston.transports.MongoDB`
const env = require('dotenv');
env.config();

const MONGO_URI = process.env.ATLAS_URI_LOGS;

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
            db: MONGO_URI,
            options: {
                useUnifiedTopology: true
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

loggerFunction = function () {
    logger.log('info', "Running logs ");
}

module.exports = loggerFunction