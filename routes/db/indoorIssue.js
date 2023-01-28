const express = require("express");

// indoorIssueRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/indoorIssue.
const indoorIssueRoutes = express.Router();

// This will help us connect to the database
let IndoorIssue = require("../../connections/indoorIssue");

// Get a list of all the indoorIssues.
indoorIssueRoutes.route("/app/indoorIssue/all").get(function (req, res, next) {
    IndoorIssue.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single indoorIssue by id
indoorIssueRoutes.route("/app/indoorIssue/:id").get(function (req, res, next) {
    IndoorIssue.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Create a new indoorIssue.
indoorIssueRoutes.route("/app/indoorIssue/add").post(function (req, res, next) {
    IndoorIssue.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Update an indoorIssue by id.
indoorIssueRoutes.route("/app/indoorIssue/update/:id").patch(function (req, res, next) {
    IndoorIssue.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            console.log(error);
            return next(error);
        } else {
            res.json(data)
            console.log('Issue updated successfully!')
        }
    })
});

// Delete an indoorIssue by id.
indoorIssueRoutes.route("/app/indoorIssue/delete/:id").delete((req, res, next) => {
    IndoorIssue.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
});

module.exports = indoorIssueRoutes;