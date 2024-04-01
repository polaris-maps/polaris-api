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

// Function to find a suitable door for routing
function selectDoorForBuilding({
    source = null,
    destination = null,
    exclude_stairs = false,
    require_automatic = false,
    current_location = null,
}) {
    //console.log(source);
    //console.log(destination);
    //console.log(current_location);
    return new Promise((resolve, reject) => {
        if (!source && !destination) {
            return reject(new Error("Source or destination must be provided"));
        }

        let doorAttributes = {
            "emergency": false
        };
        if (exclude_stairs) {
            doorAttributes = { ...doorAttributes, "stairs": true }
        };
        if (require_automatic) {
            doorAttributes = { ...doorAttributes, "automatic": true }
        };
        
        if (source && destination) {
            // Find all doors for the destination building with specified attributes
            door.find({ "building": source, ...doorAttributes }, (error, sourceDoors) => {
                if (error) {
                    reject(error);
                } else if (sourceDoors.length < 1) {
                    reject(new Error("Route Impossible: No source doors meet criteria."));
                } else {
                    sourceDoorsLocations = sourceDoors.map((door) => [door.longitude, door.latitude]);

                    door.find({ "building": destination, ...doorAttributes }, (error, destinationDoors) => {
                        if (error) {
                            reject(error);
                        } else if (destinationDoors.length < 1) {
                            reject(new Error("Route Impossible: No destination doors meet criteria."));
                        } else {
                            const destinationDoorsLocations = destinationDoors.map((door) => [door.longitude, door.latitude]);
                        
                            orsMatrix.calculate({
                                locations: [...sourceDoorsLocations, ...destinationDoorsLocations],
                                profile: "foot-walking",
                                sources: Array.from({ length: sourceDoorsLocations.length }, (_, i) => i), 
                                destinations: Array.from({ length: destinationDoorsLocations.length }, (_, i) => i + sourceDoors.length) 
                            })
                            .then(function (json) {
                                console.log(json);
                                let minDistance = Infinity;
                                let closestPair = { sourceIndex: -1, destinationIndex: -1 };
                        
                                // Loop through source locations
                                for (let i = 0; i < sourceDoorsLocations.length; i++) {
                                    // Loop through destination locations
                                    for (let j = 0; j < destinationDoorsLocations.length; j++) {
                                        // Calculate distance from source i to destination j
                                        let distance = json.durations[i][j];
                                        if (distance < minDistance) {
                                            minDistance = distance;
                                            closestPair.sourceIndex = i;
                                            closestPair.destinationIndex = j;
                                        }
                                    }
                                }
                                // Can optimize min calculation if necessary
                        
                                if (closestPair.sourceIndex >= 0 && closestPair.destinationIndex >= 0) {
                                    // Retrieve the closest pair's coordinates
                                    let sourceCoordinates = sourceDoorsLocations[closestPair.sourceIndex];
                                    let destinationCoordinates = destinationDoorsLocations[closestPair.destinationIndex - sourceDoorsLocations.length];
                        
                                    // Construct result
                                    let result = {
                                        SourceDoorCoordinates: sourceCoordinates,
                                        DestinationDoorCoordinates: destinationCoordinates,
                                        distance: minDistance
                                    };
                                    resolve(result)
                                } else {
                                    reject(new Error('An error occurred'));
                                }
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                        }
                    });
                }
            });
        }

        else if (destination) {
            // Find all doors for the destination building with specified attributes
            door.find({ "building": destination, ...doorAttributes }, (error, destinationDoors) => {
                if (error) {
                    reject(error);
                } else if (destinationDoors.length < 1) {
                    reject(new Error("Route Impossible"));
                } else {
                    const destinationDoorsLocations = destinationDoors.map((door) => [door.longitude, door.latitude]);

                    const startLocationArray = [[current_location[0], current_location[1]]];

                    orsMatrix.calculate({
                        locations: [...startLocationArray, ...destinationDoorsLocations],
                        profile: "foot-walking",
                        sources: [0], 
                        destinations: Array.from({ length: destinationDoorsLocations.length }, (_, i) => i + 1) 
                    })
                    .then(function (json) {
                        let minDuration = Infinity;
                        let destinationIndex = -1;

                        const durations = json.durations[0]; 
                        durations.forEach((duration, i) => {
                            if (duration < minDuration) {
                                minDuration = duration;
                                destinationIndex = i; 
                            }
                        });

                        if (destinationIndex !== -1) {
                            const shortestPath = {
                                start: current_location,
                                end: [destinationDoors[destinationIndex].longitude, destinationDoors[destinationIndex].latitude],
                                duration: minDuration
                            };
                            resolve(shortestPath)
                        } else {
                            reject(new Error('An error occurred'));
                        }
                    })
                    .catch(function (err) {
                        reject(err);
                    });
                }
            });
        }
    });
}

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
        avoid_obstacles: adaptiveNavDataReq.avoid_obstacles ?? defaultAdaptiveNav.avoid_obstacles,
        source_building: adaptiveNavDataReq.source_building ?? null,
        destination_building: adaptiveNavDataReq.destination_building ?? null,
    }
    let doorSelectionPromise;

    if (adaptiveNavDataReq.source_building && adaptiveNavDataReq.destination_building) {
        // If both source and destination buildings are provided
        doorSelectionPromise = selectDoorForBuilding({
            source: adaptiveNavDataReq.source_building,
            destination: adaptiveNavDataReq.destination_building,
            exclude_stairs: adaptiveNavDataReq.exclude_stairs,
            require_automatic: adaptiveNavDataReq.require_automatic
        });
    } else if (adaptiveNavDataReq.destination_building) {
        // If only destination building is provided
        doorSelectionPromise = selectDoorForBuilding({
            current_location: adaptiveNavDataReq.coordinates[0],
            destination: adaptiveNavDataReq.destination_building,
            exclude_stairs: adaptiveNavDataReq.exclude_stairs,
            require_automatic: adaptiveNavDataReq.require_automatic
        });
    } else {
        // No building selection needed; proceed directly to route calculation
        doorSelectionPromise = Promise.resolve();
    }

    doorSelectionPromise.then(sourceCoordinates => {
        if (sourceCoordinates) {
            if (sourceCoordinates.SourceDoorCoordinates && sourceCoordinates.DestinationDoorCoordinates) {
                adaptiveNavDataReq.coordinates[0] = sourceCoordinates.SourceDoorCoordinates;
                adaptiveNavDataReq.coordinates[1] = sourceCoordinates.DestinationDoorCoordinates;
            } else if (sourceCoordinates.end) {
                adaptiveNavDataReq.coordinates[1] = sourceCoordinates.end;
            }
        }

        // Get obstacle locations of relevant obstacles
        return outdoorIssue.find({ "category": { $in: adaptiveNavDataReq.avoid_obstacles } }, "avoidPolygon").exec();
    })
    .then(obstacleData => {
        const avoidPolygons = obstacleData.map(obj => obj.avoidPolygon);

        let adaptiveNavOptions = {
            avoid_features: adaptiveNavDataReq.avoid_features ?? defaultAdaptiveNav.avoid_features,
            profile_params: {
                "restrictions": adaptiveNavDataReq.restrictions ?? defaultAdaptiveNav.restrictions
            }
        };

        if (avoidPolygons.length > 0) {
            adaptiveNavOptions = {
                ...adaptiveNavOptions,
                avoid_polygons: {
                    type: 'Polygon',
                    coordinates: avoidPolygons
                }
            }
        }

        // Given obstacle list and route features, return route.
        return orsDirections.calculate({
            coordinates: adaptiveNavDataReq.coordinates,
            profile: 'wheelchair',
            options: adaptiveNavOptions,
            format: 'geojson'
        });
    })
    .then(function (json) {
        res.status(200).json(json);
    })
    .catch(function (err) {
        return next(err);
    });
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

adaptiveNavRoutes.route("/app/route/hardcoded-test2").get(function (req, res, next) {
    orsDirections.calculate({
        coordinates: [[-79.046187, 35.910986], [-79.053061, 35.909575]],
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
                        [
                            -79.050574,
                            35.910172
                        ],
                        [
                            -79.04985,
                            35.910457
                        ],
                        [
                            -79.049587,
                            35.909994
                        ],
                        [
                            -79.050312,
                            35.909731
                        ],
                        [
                            -79.050574,
                            35.910172
                        ]
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

// Given a start and an end building, determine the doors to use for routing, considering distance and door restrictions.
adaptiveNavRoutes.route("/app/route/minimize-door-distance-2").post(function (req, res, next) {
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

                             console.log(json);
                             let minDistance = Infinity;
                             let closestPair = { sourceIndex: -1, destinationIndex: -1 };
                     
                             // Loop through source locations
                             for (let i = 0; i < sourceDoorsLocations.length; i++) {
                                 // Loop through destination locations
                                 for (let j = 0; j < destinationDoorsLocations.length; j++) {
                                     // Calculate distance from source i to destination j
                                     let distance = json.durations[i][j];
                                     if (distance < minDistance) {
                                         minDistance = distance;
                                         closestPair.sourceIndex = i;
                                         closestPair.destinationIndex = j;
                                     }
                                 }
                             }
                     
                             if (closestPair.sourceIndex >= 0 && closestPair.destinationIndex >= 0) {
                                 // Retrieve the closest pair's coordinates
                                 let sourceCoordinates = sourceDoorsLocations[closestPair.sourceIndex];
                                 let destinationCoordinates = destinationDoorsLocations[closestPair.destinationIndex - sourceDoorsLocations.length];
                     
                                 // Construct result
                                 let result2 = {
                                     SourceDoorCoordinates: sourceCoordinates,
                                     DestinationDoorCoordinates: destinationCoordinates,
                                     distance: minDistance
                                 };
                                 res.status(200).json(result2);
                             } 

                            
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                }
            })
        }
    })
});

adaptiveNavRoutes.route("/app/route/to-door").post(function (req, res, next) {
    const rawLocationReq = req.body;

    const currentLocation = {
        longitude: rawLocationReq.longitude, // required
        latitude: rawLocationReq.latitude, // required
    };

    /** @type {DoorDistanceRequest} */
    const locationReq = {
        destination: rawLocationReq.destination, // required
        number: rawLocationReq.maximum_number_results ?? defaultDoorDistanceReq.maximum_number_results,
        exclude_stairs: rawLocationReq.exclude_stairs ?? defaultDoorDistanceReq.exclude_stairs,
        require_automatic: rawLocationReq.require_automatic ?? defaultDoorDistanceReq.require_automatic
    };

    let doorAttributes = {
        "emergency": false
    };
    if (locationReq.exclude_stairs) {
        doorAttributes = { ...doorAttributes, "stairs": false }
    };
    if (locationReq.require_automatic) {
        doorAttributes = { ...doorAttributes, "automatic": true }
    };

    // Find all doors for the destination building with specified attributes
    door.find({ "building": locationReq.destination, ...doorAttributes }, (error, destinationDoors) => {
        if (error) {
            return next(error);
        } else if (destinationDoors.length < 1) {
            res.status(404).json({ "message": "Route impossible. (No destination doors exist with those attributes.)" });
        } else {
            const destinationDoorsLocations = destinationDoors.map((door) => [door.longitude, door.latitude]);

            const startLocationArray = [[currentLocation.longitude, currentLocation.latitude]];

            orsMatrix.calculate({
                locations: [...startLocationArray, ...destinationDoorsLocations],
                profile: "foot-walking",
                sources: [0], 
                destinations: Array.from({ length: destinationDoorsLocations.length }, (_, i) => i + 1) 
            })
            .then(function (json) {
                let minDuration = Infinity;
                let destinationIndex = -1;

                const durations = json.durations[0]; 
                durations.forEach((duration, i) => {
                    if (duration < minDuration) {
                        minDuration = duration;
                        destinationIndex = i; 
                    }
                });

                if (destinationIndex !== -1) {
                    const shortestPath = {
                        start: currentLocation,
                        end: destinationDoors[destinationIndex],
                        duration: minDuration
                    };

                    res.status(200).json(shortestPath);
                } else {
                    // Handle case where no path was found
                    res.status(404).json({ message: "No path found" });
                }
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
});


module.exports = adaptiveNavRoutes;