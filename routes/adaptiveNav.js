const {
    PermanentFeature,
    Surface,
    Track,
    Smoothness,
    Obstacle,
    Restrictions,
    AdaptiveNavRouteRequest,
    DoorDistanceRequest
} = require("./types");

const express = require("express");
const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

const ROUTE_IMPOSSIBLE = 500;

// let IndoorIssue = require("../connections/indoorIssue");
let outdoorIssue = require("../connections/outdoorIssue");
let door = require("../connections/door");

const openRouteService = require("openrouteservice-js");
let orsDirections = new openRouteService.Directions({ api_key: process.env.ORS_API_KEY });
let orsMatrix = new openRouteService.Matrix({ api_key: process.env.ORS_API_KEY })

// TODO: customize defaults
const defaultAdaptiveNav = {
    avoid_features: ["steps"], // avoid steps by default
    avoid_obstacles: [],
    restrictions: {
        "surface_type": "cobblestone:flattened",
        "track_type": "grade1",
        "smoothness_type": "good",
        "maximum_incline": 6
    }
}

const defaultDoorDistanceReq = {
    maximum_number_results: 1,
    exclude_stairs: false,
    require_automatic: false
}

let nSmallest = (n, arr) => {
    const copy = arr.slice();
    for(let i = 0; i < n - 1; i++){
        const minIndex = copy.indexOf(Math.min(...copy));
        copy.splice(minIndex, 1);
    };
    return Math.min(...copy);
};

// adaptiveNavRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/building.
const adaptiveNavRoutes = express.Router();

adaptiveNavRoutes.route("/app/route").post(function (req, res, next) {
    adaptiveNavDataReq = req.body;

    /** @type {AdaptiveNavRouteRequest} */
    adaptiveNavData = {
        coordinates: adaptiveNavDataReq.coordinates, // Only field required
        avoid_features: adaptiveNavDataReq.avoid_features ?? defaultAdaptiveNav.avoid_features,
        restrictions: adaptiveNavDataReq.restrictions ?? defaultAdaptiveNav.restrictions,
        avoid_obstacles: adaptiveNavDataReq.avoid_obstacles ?? defaultAdaptiveNav.avoid_obstacles
    }

    // Get obstacle locations of relevant obstacles
    obstacleList = [];
    outdoorIssue.find({ "category": { $in: adaptiveNavData.avoid_obstacles } }, "avoidPolygon", (error, obstacleData) => {
        if (error) {
            return next(error)
        } else {
            console.log(adaptiveNavDataReq.avoid_features);
            // console.log("Obstacle Data:", obstacleData);
            const avoidPolygons = obstacleData.map(obj => obj.avoidPolygon);
            // console.log("Polygon Data:", avoidPolygons);

            // console.log("Request Payload:", {
            //     coordinates: adaptiveNavData.coordinates,
            //     profile: 'wheelchair',
            //     options: {
            //       avoid_features: adaptiveNavData.avoid_features,
            //       profile_params: {
            //         "restrictions": adaptiveNavData.restrictions
            //       },
            //       avoid_polygons: {
            //         type: 'Polygon',
            //         coordinates: [avoidPolygons]
            //       }
            //     },
            //     format: 'geojson'
            //   });
            // Given obstacle list and route features, return route.
            orsDirections.calculate(
                {
                    coordinates: adaptiveNavData.coordinates,
                    profile: 'wheelchair', // allow walking or wheelchair
                    options: {
                        avoid_features: adaptiveNavData.avoid_features, // can you keep steps in with wheelchair profile?
                        profile_params: {
                            "restrictions": adaptiveNavData.restrictions
                        },
                        avoid_polygons: {
                            type: 'Polygon',
                            coordinates: 
                                avoidPolygons
                        }
                    },
                    format: 'geojson'
                })
                .then(function (json) {
                    // Add your own result handling here
                    res.status(200).json(json);
                })
                .catch(function (err) {
                    return next(err);
                });
        }
    })
});

adaptiveNavRoutes.route("/app/route/hardcoded-test").get(function (req, res, next) {
    orsDirections.calculate({
        coordinates: [[8.690958, 49.404662], [8.687868, 49.390139]],
        profile: 'wheelchair',
        options: {
            avoid_features: ["steps"],
            profile_params: {
                "restrictions": {
                    "surface_type": "cobblestone:flattened",
                    "track_type": "grade1",
                    "smoothness_type": "good",
                    "maximum_incline": 6
                }
            },
            avoid_polygons: {
                type: 'Polygon',
                coordinates: [
                    [
                        [8.683533668518066, 49.41987949639816],
                        [8.680272102355957, 49.41812070066643],
                        [8.683919906616211, 49.4132348262363],
                        [8.689756393432617, 49.41806486484901],
                        [8.683533668518066, 49.41987949639816]
                    ]
                ]
            }
        },
        format: 'geojson'
    })
        .then(function (json) {
            res.status(200).json(json);
        })
        .catch(function (err) {
            return next(err);
        });
});

// Given a start and an end building, determine the doors to use for routing, considering distance and door restrictions.
adaptiveNavRoutes.route("/app/route/minimize-door-distance").post(function (req, res, next) {
    rawDistanceReq = req.body;

    /** @type {DoorDistanceRequest} */
    distanceReq = {
        source: rawDistanceReq.source, // required
        destination: rawDistanceReq.destination, // required
        number: rawDistanceReq.maximum_number_results ?? defaultDoorDistanceReq.maximum_number_results,
        exclude_stairs: rawDistanceReq.exclude_stairs ?? defaultDoorDistanceReq.exclude_stairs,
        require_automatic: rawDistanceReq.require_automatic ?? defaultDoorDistanceReq.require_automatic
    }

    let doorAttributes = {
        "emergency": false
    };
    if (distanceReq.exclude_stairs) {
        doorAttributes = { ...doorAttributes, "stairs": false}
    };
    if (distanceReq.require_automatic) {
        doorAttributes = { ...doorAttributes, "automatic": true}
    };

    // get all doors for source and dest buildings, and use for matrix calculations
    door.find({ "building": distanceReq.source, ...doorAttributes }, (error, sourceDoors) => {
        if (error) {
            return next(error)
        } else if (sourceDoors.length < 1) {
            res.json({ "message": "Route impossible. (No source doors exist with those attributes.) (500)" })
            res.status(ROUTE_IMPOSSIBLE)
        } else {
            sourceDoorsLocations = sourceDoors.map((door) => [door.longitude, door.latitude]);

            door.find({ "building": distanceReq.destination, ...doorAttributes }, (error, destinationDoors) => {
                if (error) {
                    return next(error)
                } else if (destinationDoors.length < 1) {
                    res.json({ "message": "Route impossible. (No destination doors exist with those attributes.) (500)" })
                    res.status(ROUTE_IMPOSSIBLE)
                } else {
                    testdestinationDoorsLocations = destinationDoors.map((door) => [door.longitude, door.latitude]);
                    test = [[-79.050822, 35.91312]]
                    destinationDoorsLocations = [...testdestinationDoorsLocations, ...test]
                    console.log(destinationDoorsLocations)
                    orsMatrix.calculate({
                        locations: [...sourceDoorsLocations, ...destinationDoorsLocations],
                        profile: "foot-walking",
                        sources: Array.from({ length: sourceDoorsLocations.length }, (_, i) => i),  // instead of 'all'
                        destinations: Array.from({ length: destinationDoorsLocations.length }, (_, i) => i + sourceDoors.length)  // instead of 'all'
                    })
                        .then(function (json) {
                            // return a limited number of longitude and latitudes to consider.
                            // durations are assumed to be given as an array of arrays, 
                            // where the outer array is indexed by source,
                            // and the inner array is indexed by destination.

                            console.log(json)

                            // todo: fix durations cleaned
                            durationsCleaned = (json.durations).map((listDuration) => listDuration[0]);
                            maxDuration = nSmallest(distanceReq.number, durationsCleaned);

                            console.log(durationsCleaned)

                            result = [];
                            for(let i = 0; i < durationsCleaned.length; i++){
                                if(durationsCleaned[i] > maxDuration){
                                   continue;
                                };
                                // json.metadata.query.locations[i]
                                result.push({
                                    "source": "",
                                    "destination": ""
                                });
                             };

                            res.status(200).json(json);
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                }
            })
        }
    })
});

module.exports = adaptiveNavRoutes;