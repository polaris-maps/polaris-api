const express = require("express");

// userRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/user.
const userRoutes = express.Router();

// This will help us connect to the database
let User = require("../../connections/user");

// Get a list of all the users.
userRoutes.route("/app/user/all").get(function (req, res, next) {
    User.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Get a single user by id
userRoutes.route("/app/user/:id").get(function (req, res, next) {
    User.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
});

// Create a new user.
userRoutes.route("/app/user/add").post(function (req, res, next) {
    User.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json({
                message: "successfully added user",
                data: data
            })
        }
    })
});

// Update a user by id.
userRoutes.route("/app/user/update/:id").put(function (req, res, next) {
    User.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                message: "successfully updated user",
                oldData: data
            })
        }
    })
});

// Delete a user by id.
userRoutes.route("/app/user/delete/:id").delete((req, res, next) => {
    User.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            if (!data) {
                res.status(404).json({
                    message: "user of that id was not found (404)",
                    id: req.params.id
                })
                return;
            }

            res.status(200).json({
                message: "successfully deleted user",
                data: data
            })
        }
    })
});

module.exports = userRoutes;