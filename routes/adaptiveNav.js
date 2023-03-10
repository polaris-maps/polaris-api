// import * as RouteFeatures from "./types";

const express = require("express");
const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

// let IndoorIssue = require("../connections/indoorIssue");
let outdoorIssue = require("../connections/outdoorIssue");

const openRouteService = require("openrouteservice-js");
let orsDirections = new openRouteService.Directions({ api_key: process.env.ORS_API_KEY });

// adaptiveNavRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/building.
const adaptiveNavRoutes = express.Router();

adaptiveNavRoutes.route("/app/route").post(function (req, res, next) {
  /** @type {AdaptiveNavRouteRequest} */
  adaptiveNavData = req.body;

  // Get obstacle locations of relevant obstacles
  obstacleList = [];
  outdoorIssue.find({ "category": { $in: adaptiveNavData.avoid_obstacles } }, "avoidPolygon", (error, obstacleData) => {
    if (error) {
      return next(error)
    } else {
      // Given obstacle list and route features, return route.
      orsDirections.calculate(
        {
          coordinates: adaptiveNavData.coordinates,
          profile: 'wheelchair',
          options: {
            avoid_features: adaptiveNavData.avoid_features, // can you keep steps in with wheelchair profile?
            profile_params: adaptiveNavData.restrictions,
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

module.exports = adaptiveNavRoutes;