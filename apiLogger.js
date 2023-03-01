/* Sources: 
* https://github.com/bithavoc/express-winston
* https://stackoverflow.com/questions/55606854/how-to-use-express-winston-and-winston-mongodb-together
* https://stackoverflow.com/questions/13941957/unable-to-save-logs-to-mongodb-database-for-winston-nodejs
*/

const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });
var winston = require('winston'),
expressWinston = require('express-winston');
require('winston-mongodb');  // expose `winston.transports.MongoDB`

logger = expressWinston.logger({
    transports: [
        // Uncomment Console/File transports for debug
        // // Console transport
        // new winston.transports.Console(),
        // // File transport
        // new winston.transports.File({
        //     filename: 'winstonLogs.log',
        //     format: winston.format.combine(
        //         winston.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
        //         winston.format.align(),
        //         winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
        //     )
        // }),
        // MongoDB transport
        new winston.transports.MongoDB({
            level: 'info',
            db: process.env.ATLAS_URI_LOGS,
            options: {
                useUnifiedTopology: true,
            },
            collection: 'api',
            format: winston.format.combine(
                winston.format.timestamp(),
                //convert logs to a json format for mongodb
                winston.format.json()
            ),
            metaKey:'meta'
        })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    // message: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: false, // Use the default Express/morgan request formatting. Enabling this will override any message if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
})

// TODO: Add error logger

module.exports = logger