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

// Get a list of all the indoorIssues of specific categories.
indoorIssueRoutes.route("/app/indoorIssue/filtered").post(function (req, res, next) {
    indoorIssue.find({ "category": { $in: req.body.category } }, (error, data) => {
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
            res.status(200).json({
                message: "successfully added indoor issue",
                data: data
            })
        }
    })
});

// Update an indoorIssue by id.
indoorIssueRoutes.route("/app/indoorIssue/update/:id").patch(function (req, res, next) {
    IndoorIssue.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                message: "successfully updated indoor issue",
                oldData: data
            })
        }
    })
});

// Delete an indoorIssue by id.
indoorIssueRoutes.route("/app/indoorIssue/delete/:id").delete((req, res, next) => {
    IndoorIssue.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            if (!data) {
                res.status(404).json({
                    message: "indoor issue of that id was not found (404)",
                    id: req.params.id
                })
                return;
            }

            res.status(200).json({
                message: "successfully deleted indoor issue",
                data: data
            })
        }
    })
});

module.exports = indoorIssueRoutes;