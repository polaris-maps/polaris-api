const express = require("express");

// outdoorIssueRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/outdoorIssue.
const outdoorIssueRoutes = express.Router();

// This will help us connect to the database
let outdoorIssue = require("../../connections/outdoorIssue");

// Get a list of all the outdoorIssues.
outdoorIssueRoutes.route("/app/outdoorIssue/all").get(function (req, res, next) {
    outdoorIssue.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// (Added) Get a list of all the outdoorIssues of specific categories.
outdoorIssueRoutes.route("/app/outdoorIssue/filtered").post(function (req, res, next) {
    outdoorIssue.find({ "category": { $in: req.body.category } }, "avoidPolygon", (error, obstacleData) => {
        if (error) {
          return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single outdoorIssue by id
outdoorIssueRoutes.route("/app/outdoorIssue/:id").get(function (req, res, next) {
    outdoorIssue.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Create a new outdoorIssue.
outdoorIssueRoutes.route("/app/outdoorIssue/add").post(function (req, res, next) {
    outdoorIssue.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Update an outdoorIssue by id.
outdoorIssueRoutes.route("/app/outdoorIssue/update/:id").patch(function (req, res, next) {
    outdoorIssue.findByIdAndUpdate(req.params.id, {
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

// Delete an outdoorIssue by id.
outdoorIssueRoutes.route("/app/outdoorIssue/delete/:id").delete((req, res, next) => {
    outdoorIssue.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
});

module.exports = outdoorIssueRoutes;