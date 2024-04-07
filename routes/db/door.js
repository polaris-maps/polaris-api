const express = require("express");

// doorRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/door.
const doorRoutes = express.Router();

// This will help us connect to the database
let door = require("../../connections/door");//SQL Connect to doors

// Get a list of all the doors.
doorRoutes.route("/app/door/all").get(function (req, res, next) {
    //SQL Equivalent:
    //SELECT * FROM Door
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
    //SQL Equivalent:
    //SELECT * FROM Door WHERE building_id = id;
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
    //SQL Equivalent:
    //SELECT * FROM Door WHERE door_id = id;
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
    //SQL Equivalent
    //INSERT INTO Door (node_id, latitude, longitude, building_id, is_indoor, is_emergency, is_service) 
    //VALUES (YourNodeId, YourLatitude, YourLongitude, YourBuildingId, YourIsIndoor, YourIsEmergency, YourIsService);
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
    //SQL Equivalent
    //INSERT INTO Door (node_id, latitude, longitude, building_id, is_indoor, is_emergency, is_service) 
    //VALUES (YourNodeId, YourLatitude, YourLongitude, YourBuildingId, YourIsIndoor, YourIsEmergency, YourIsService);
    //......
    //......
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
    //SQL Equivalent:
    //UPDATE Door 
    //SET node_id = NewNodeId, latitude = NewLatitude, longitude = NewLongitude, building_id = NewBuildingId, is_indoor = NewIsIndoor, is_emergency = NewIsEmergency, is_service = NewIsService
    //WHERE door_id = YourDoorID;
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
    //SQL Equivalent:
    //DELETE * FROM Door WHERE id = id
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