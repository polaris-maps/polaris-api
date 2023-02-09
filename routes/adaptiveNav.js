const express = require("express");
const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

const openRouteService = require("openrouteservice-js");
let orsDirections = new openRouteService.Directions({ api_key: process.env.ORS_API_KEY });

// adaptiveNavRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/building.
const adaptiveNavRoutes = express.Router();

adaptiveNavRoutes.route("/app/test/route").get(function (req, res, next) {
  // Given a user profile, filter obstacle list.
  // Given obstacle list, start, and stop, return route.
  orsDirections.calculate({
    coordinates: [[8.690958, 49.404662], [8.687868, 49.390139]],
    profile: 'wheelchair',
    options: {
      avoid_features: ["ferries", "steps"],
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
    format: 'json'
  })
    .then(function (json) {
      // Add your own result handling here
      res.json(JSON.stringify(json));
    })
    .catch(function (err) {
      return next(err);
    });
});

adaptiveNavRoutes.route("/app/test/route").get(function (req, res, next) {
  // Given a user profile, filter obstacle list.
  // Given obstacle list, start, and stop, return route.
  orsDirections.calculate({
    coordinates: [[8.690958, 49.404662], [8.687868, 49.390139]],
    profile: 'wheelchair',
    options: {
      avoid_features: ["ferries", "steps"],
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
    format: 'json'
  })
    .then(function (json) {
      // Add your own result handling here
      res.json(JSON.stringify(json));
    })
    .catch(function (err) {
      return next(err);
    });
});

module.exports = adaptiveNavRoutes;