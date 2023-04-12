const {
    PermanentFeature,
    Surface,
    Track,
    Smoothness,
    Obstacle,
    Restrictions,
    AdaptiveNavRouteRequest
} = require("./types");

const express = require("express");
const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

// let IndoorIssue = require("../connections/indoorIssue");
let outdoorIssue = require("../connections/outdoorIssue");

const openRouteService = require("openrouteservice-js");
let orsDirections = new openRouteService.Directions({ api_key: process.env.ORS_API_KEY });
let orsMatrix = new Openrouteservice.Matrix({ api_key: process.env.ORS_API_KEY })

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
              coordinates: [
                obstacleData
              ]
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

adaptiveNavRoutes.route("/app/route/hardcodedtest").get(function (req, res, next) {
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

// Given a start and an end building, determine the doors to use for routing, considering only distance.
adaptiveNavRoutes.route("/app/route/minimizedoordistance").post(function (req, res, next) {
    distanceReq = req.body;

    // get all doors for source and dest buildings
  
    // Get obstacle locations of relevant obstacles // TODO: complete
    obstacleList = [];
    outdoorIssue.find({ "category": { $in: adaptiveNavData.avoid_obstacles } }, "avoidPolygon", (error, obstacleData) => {
      if (error) {
        return next(error)
      } else {
          console.log(adaptiveNavDataReq.avoid_features);
        // Given obstacle list and route features, return route.
        Matrix.calculate({
            locations: [[8.690958, 49.404662], [8.687868, 49.390139], [8.687868, 49.390133]],
            profile: "walking",
            sources: ['all'],
            destinations: ['all']
          })
          .then(function(response) {
            // Add your own result handling here
            console.log("response", response)
          })
          .catch(function(err) {
            const str = "An error occurred: " + err
            console.log(str)
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

module.exports = adaptiveNavRoutes;