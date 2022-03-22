const express = require("express");

// issueRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /issue.
const issueRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;


// This section will help you get a list of all the issues.
issueRoutes.route("/issue").get(function (req, res) {
    let db_connect = dbo.getDb("Polaris");
    db_connect
        .collection("issues")
        .find({})
        .toArray(function (err, result) {
            if (err) throw err;
            res.json(result);
        });
});

// This section will help you get a single issue by id
issueRoutes.route("/issue/:id").get(function (req, res) {
    let db_connect = dbo.getDb();
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect
        .collection("issues")
        .findOne(myquery, function (err, result) {
            if (err) throw err;
            res.json(result);
        });
});

// This section will help you create a new issue.
issueRoutes.route("/issue/add").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myobj = {
        location: req.body.issue_location,
        description: req.body.issue_description,
        status: req.body.issue_status,
        datetimeOpen: req.body.issue_datetimeOpen,
        datetimeClosed: req.body.issue_datetimeClosed,
        datetimePermanent: req.body.issue_datetimePermanent,
        votes: req.body.issue_votes,
    };
    db_connect.collection("issues").insertOne(myobj, function (err, res) {
        if (err) throw err;
        response.json(res);
    });
});

// This section will help you update a issue by id.
issueRoutes.route("/update/:id").post(function (req, response) {
    let db_connect = dbo.getDb();
    let myquery = { _id: ObjectId(req.params.id) };
    let newvalues = {
        $set: {
            issue_location: req.body.issue_location,
            issue_description: req.body.issue_description,
            issue_status: req.body.issue_status,
            issue_datetimeOpen: req.body.issue_datetimeOpen,
            issue_datetimeClosed: req.body.issue_datetimeClosed,
            issue_datetimePermanent: req.body.issue_datetimePermanent,
            issue_votes: req.body.issue_votes,
        },
    };
    db_connect
        .collection("issues")
        .updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            response.json(res);
        });
});

// This section will help you delete a issue
issueRoutes.route("/:id").delete((req, response) => {
    let db_connect = dbo.getDb();
    let myquery = { _id: ObjectId(req.params.id) };
    db_connect.collection("issues").deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        response.json(obj);
    });
});

module.exports = issueRoutes;