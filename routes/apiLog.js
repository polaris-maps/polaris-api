const express = require("express");

// apiLogRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/apiLog.
const apiLogRoutes = express.Router();

// This will help us connect to the database
let ApiLog = require("../connections/apiLog");

// Get a list of all the api log records.
apiLogRoutes.route("/app/apiLog/all").get(function (req, res, next) {
    ApiLog.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single api log record by id
apiLogRoutes.route("/app/apiLog/:id").get(function (req, res, next) {
    ApiLog.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

module.exports = apiLogRoutes;