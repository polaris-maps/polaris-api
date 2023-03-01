const express = require("express");

// clientLogRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/clientLog.
const clientLogRoutes = express.Router();

// This will help us connect to the database
let ClientLog = require("../../connections/clientLog");

// Get a list of all the client log records.
clientLogRoutes.route("/app/clientLog/all").get(function (req, res, next) {
    ClientLog.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single client log record by id
clientLogRoutes.route("/app/clientLog/:id").get(function (req, res, next) {
    ClientLog.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Create a new clientLog.
clientLogRoutes.route("/app/clientLog/add").post(function (req, res, next) {
    ClientLog.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json({
                message: "successfully added client log record",
                data: data
            })
        }
    })
});

module.exports = clientLogRoutes;