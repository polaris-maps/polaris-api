const express = require("express");

// buildingRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/building.
const buildingRoutes = express.Router();

// This will help us connect to the database
let building = require("../../connections/building");//SQL Get all buildings

// Get a list of all the buildings.
buildingRoutes.route("/app/building/all").get(function (req, res, next) {
    //SQL Equivalent:
    //SELECT * FROM Location
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
    //SQL Equivalent:
    //Select * FROM Location WHERE location_id = id
    building.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// // Get a single building by name
// buildingRoutes.route("/app/building/name/:name").get(function (req, res, next) {
//     building.findOne({ name: req.params.name }, (error, data) => {
//         if (error) {
//             return next(error);
//         } else {
//             if (!data) {
//                 res.status(404).json({
//                     message: "Building with that name not found (404)",
//                     name: req.params.name
//                 });
//                 return;
//             }
//             res.json(data);
//         }
//     });
// });

// Get buildings by name (partial match)
// buildingRoutes.route("/app/building/name/:name").get(function (req, res, next) {
//     const nameRegex = new RegExp(req.params.name, 'i'); 

//     building.find({ name: { $regex: nameRegex } }, (error, data) => {
//         if (error) {
//             return next(error);
//         } else {
//             if (!data || data.length === 0) {
//                 res.status(404).json({
//                     message: "No buildings found containing the name",
//                     name: req.params.name
//                 });
//                 return;
//             }
//             res.json(data);
//         }
//     });
// });


// Create a new building.
buildingRoutes.route("/app/building/add").post(function (req, res, next) {
    //SQL Equivalent:
    //INSERT INTO Location (full_name, abbreviation, defaultLatitude, defaultLongitude, campus_id, geo_address) 
    //VALUES ('YourFullName', 'YourAbbreviation', YourDefaultLatitude, YourDefaultLongitude, YourCampusId, 'YourGeoAddress');

    building.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json({
                message: "successfully added building",
                data: data
            })
        }
    })
});

// Create multiple new buildings.
buildingRoutes.route("/app/building/add/multiple").post(function (req, res, next) {
    //SQL Equivalent:
    //INSERT INTO Location (full_name, abbreviation, defaultLatitude, defaultLongitude, campus_id, geo_address) 
    //VALUES ('YourFullName', 'YourAbbreviation', YourDefaultLatitude, YourDefaultLongitude, YourCampusId, 'YourGeoAddress');
    //.......
    //.......
    building.insertMany(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json({
                message: "successfully added multiple buildings",
                data: data
            })
        }
    })
});

// Update an building by id.
buildingRoutes.route("/app/building/update/:id").patch(function (req, res, next) {
    //SQL Equivalent:
    //SELECT * FROM Location WHERE location_id = id
    building.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                message: "successfully updated building",
                oldData: data
            })
        }
    })
});

// Delete an building by id.
buildingRoutes.route("/app/building/delete/:id").delete((req, res, next) => {
    //SQL Equivalent:
    //DELETE FROM Location WHERE location_id = id
    building.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            if (!data) {
                res.status(404).json({
                    message: "building of that id was not found (404)",
                    id: req.params.id
                })
                return;
            }

            res.status(200).json({
                message: "successfully deleted building",
                data: data
            })
        }
    })
});

module.exports = buildingRoutes;