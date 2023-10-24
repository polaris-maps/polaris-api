const express = require("express");

// doorRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/door.
const doorRoutes = express.Router();

// This will help us connect to the database
let door = require("../../connections/door");

// Get a list of all the doors.
doorRoutes.route("/app/door/all").get(function (req, res, next) {
    door.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a list of all the doors of a specific building.
doorRoutes.route("/app/door/filtered/:buildingId").get(function (req, res, next) {
    door.find({ "building": req.params.buildingId }, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single door by id
doorRoutes.route("/app/door/:id").get(function (req, res, next) {
    door.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Create a new door.
doorRoutes.route("/app/door/add").post(function (req, res, next) {
    door.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json({
                message: "successfully added door",
                data: data
            })
        }
    })
});

// Create multiple new doors.
doorRoutes.route("/app/door/add/multiple").post(function (req, res, next) {
    door.insertMany(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json({
                message: "successfully added multiple doors",
                data: data
            })
        }
    })
});

// Update an door by id.
doorRoutes.route("/app/door/update/:id").patch(function (req, res, next) {
    door.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                message: "successfully updated door",
                oldData: data
            })
        }
    })
});

// Delete an door by id.
doorRoutes.route("/app/door/delete/:id").delete((req, res, next) => {
    door.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            if (!data) {
                res.status(404).json({
                    message: "door of that id was not found (404)",
                    id: req.params.id
                })
                return;
            }

            res.status(200).json({
                message: "successfully deleted door",
                data: data
            })
        }
    })
});

module.exports = doorRoutes;