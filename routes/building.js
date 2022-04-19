const express = require("express");

// buildingRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/building.
const buildingRoutes = express.Router();

// This will help us connect to the database
let building = require("../connections/building");

// Get a list of all the buildings.
buildingRoutes.route("/app/building/all").get(function (req, res, next) {
    building.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single building by id
buildingRoutes.route("/app/building/:id").get(function (req, res, next) {
    building.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Create a new building.
buildingRoutes.route("/app/building/add").post(function (req, res, next) {
    building.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Update an building by id.
buildingRoutes.route("/app/building/update/:id").patch(function (req, res, next) {
    building.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            console.log(error);
            return next(error);
        } else {
            res.json(data)
            console.log('building updated successfully!')
        }
    })
});

// Delete an building by id.
buildingRoutes.route("/app/building/delete/:id").delete((req, res, next) => {
    building.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
});

module.exports = buildingRoutes;