const express = require("express");

// outdoorIssueRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/outdoorIssue.
const outdoorIssueRoutes = express.Router();

// This will help us connect to the database
let outdoorIssue = require("../../connections/outdoorIssue");

// Get a list of all the outdoorIssues.
outdoorIssueRoutes.route("/app/outdoorIssue/all").get(function (req, res, next) {
    //SQL Equivalent:
    //SELECT * FROM Issue
    outdoorIssue.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a list of all the outdoorIssues of specific categories.
outdoorIssueRoutes.route("/app/outdoorIssue/filtered").post(function (req, res, next) {
    //SELECT Issue.*
    //FROM Issue
    //JOIN IssuesAndCategories ON Issue.issue_id = IssuesAndCategories.issue_id
    //WHERE IssuesAndCategories.category = 'YourCategory';
    outdoorIssue.find({ "category": { $in: req.body.category } }, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single outdoorIssue by id
outdoorIssueRoutes.route("/app/outdoorIssue/:id").get(function (req, res, next) {
    //SQL Equivalent:
    //SELECT * FROM Issue WHERE issue_id = id
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
    //INSERT INTO Issue (avoidPolygon, location, latitude, longitude, description, status, datetimeOpen, datetimeClosed, datetimePermanent)
    // VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    
    outdoorIssue.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json({
                message: "successfully added outdoor issue",
                data: data
            })
        }
    })
});

// Update an outdoorIssue by id.
outdoorIssueRoutes.route("/app/outdoorIssue/update/:id").patch(function (req, res, next) {
    //UPDATE Issue 
    //SET avoidPolygon = ?, location = ?, latitude = ?, longitude = ?, description = ?, status = ?, datetimeOpen = ?, datetimeClosed = ?, datetimePermanent = ?, votes = ?
    //WHERE issue_id = id;

    outdoorIssue.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                message: "successfully updated outdoor issue",
                oldData: data
            })
        }
    })
});

// Delete an outdoorIssue by id.
outdoorIssueRoutes.route("/app/outdoorIssue/delete/:id").delete((req, res, next) => {
    //SQL Equivalent:
    //DELETE * FROM 
    outdoorIssue.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            if (!data) {
                res.status(404).json({
                    message: "outdoor issue of that id was not found (404)",
                    id: req.params.id
                })
                return;
            }

            res.status(200).json({
                message: "successfully deleted outdoor issue",
                data: data
            })
        }
    })
});

module.exports = outdoorIssueRoutes;