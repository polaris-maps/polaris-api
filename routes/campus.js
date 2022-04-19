const express = require("express");

// campusRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/campus.
const campusRoutes = express.Router();

// This will help us connect to the database
let campus = require("../connections/campus");

// Get a list of all the campuss.
campusRoutes.route("/app/campus/all").get(function (req, res, next) {
    campus.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single campus by id
campusRoutes.route("/app/campus/:id").get(function (req, res, next) {
    campus.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Create a new campus.
campusRoutes.route("/app/campus/add").post(function (req, res, next) {
    campus.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Update an campus by id.
campusRoutes.route("/app/campus/update/:id").patch(function (req, res, next) {
    campus.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            console.log(error);
            return next(error);
        } else {
            res.json(data)
            console.log('campus updated successfully!')
        }
    })
});

// Delete an campus by id.
campusRoutes.route("/app/campus/delete/:id").delete((req, res, next) => {
    campus.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
});

module.exports = campusRoutes;