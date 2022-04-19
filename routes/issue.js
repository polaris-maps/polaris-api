const express = require("express");

// issueRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/issue.
const issueRoutes = express.Router();

// This will help us connect to the database
let Issue = require("../connections/issue");

// Get a list of all the issues.
issueRoutes.route("/app/issue/all").get(function (req, res, next) {
    Issue.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single issue by id
issueRoutes.route("/app/issue/:id").get(function (req, res, next) {
    Issue.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Create a new issue.
issueRoutes.route("/app/issue/add").post(function (req, res, next) {
    Issue.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Update an issue by id.
issueRoutes.route("/app/issue/update/:id").patch(function (req, res, next) {
    Issue.findByIdAndUpdate(req.params.id, {
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

// Delete an issue by id.
issueRoutes.route("/app/issue/delete/:id").delete((req, res, next) => {
    Issue.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
});

module.exports = issueRoutes;