const express = require("express");

// rampRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/ramp.
const rampRoutes = express.Router();

// This will help us connect to the database
let ramp = require("../../connections/ramp");

// Get a list of all the ramps.
rampRoutes.route("/app/ramp/all").get(function (req, res, next) {
    //SQL Equivalent:
    //SELECT * FROM Ramp;
    ramp.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single ramp by id
rampRoutes.route("/app/ramp/:id").get(function (req, res, next) {
    //SQL Equivalent:
    //SELECT * FROM Ramp WHERE ramp_id = id
    ramp.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Create a new ramp.
rampRoutes.route("/app/ramp/add").post(function (req, res, next) {
    //SQL Equivalent:
    //INSERT INTO Ramp (latitude, longitude, building) 
    //VALUES (lat, long, building)
    ramp.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json({
                message: "successfully added ramp",
                data: data
            })
        }
    })
});

// Create multiple new ramps.
rampRoutes.route("/app/ramp/add/multiple").post(function (req, res, next) {
    //INSERT INTO Ramp (latitude, longitude, building) 
    //VALUES (lat, long, building), (lat2, long2, build2), .....
    ramp.insertMany(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json({
                message: "successfully added multiple ramps",
                data: data
            })
        }
    })
});

// Update an ramp by id.
rampRoutes.route("/app/ramp/update/:id").patch(function (req, res, next) {
    //UPDATE Ramp SET latitude = newLat, longitude = newLong, building = newBuilding 
    //WHERE ramp_id = ?;
    ramp.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                message: "successfully updated ramp",
                oldData: data
            })
        }
    })
});

// Delete an ramp by id.
rampRoutes.route("/app/ramp/delete/:id").delete((req, res, next) => {
    //SQL Equivalent
    //DELETE FROM Ramp WHERE ramp_id = ?
    ramp.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            if (!data) {
                res.status(404).json({
                    message: "ramp of that id was not found (404)",
                    id: req.params.id
                })
                return;
            }

            res.status(200).json({
                message: "successfully deleted ramp",
                data: data
            })
        }
    })
});

module.exports = rampRoutes;