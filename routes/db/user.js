const express = require("express");

// userRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/user.
const userRoutes = express.Router();

// This will help us connect to the database
const pool = require("../../connections/pool");

// Get a list of all the users.
userRoutes.route("/app/user/all").get(async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Profile');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Get a single user by id
userRoutes.route("/app/user/:id").get(async (req, res, next) => {
    try {
        const profileId = req.params.id;
        const { rows } = await pool.query('SELECT * FROM Profile WHERE profile_id = $1', [profileId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Profile not found" });
        }
    } catch (error) {
        next(error);
    }
});

// Create a new user.
userRoutes.route("/app/user/add").post(async (req, res, next) => {
    const { favoriteLocations, indoorIssueInteractions, indoorIssuesCreated } = req.body;
    const queryText = `
        INSERT INTO Profile (favoriteLocations, indoorIssueInteractions, indoorIssuesCreated)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    
    try {
        const { rows } = await pool.query(queryText, [favoriteLocations, indoorIssueInteractions, indoorIssuesCreated]);
        res.status(200).json({
            message: "Successfully added profile",
            data: rows[0]
        });
    } catch (error) {
        next(error);
    }
});
// Update a user by id.
userRoutes.route("/app/user/update/:id").put(async (req, res, next) => {
    const profileId = req.params.id;
    const updates = req.body;
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');

    const queryText = `UPDATE Profile SET ${setClause} WHERE profile_id = $1 RETURNING *`;

    try {
        const { rows } = await pool.query(queryText, [profileId, ...values]);
        if (rows.length > 0) {
            res.status(200).json({
                message: "Successfully updated profile",
                data: rows[0]
            });
        } else {
            res.status(404).json({ message: "Profile not found" });
        }
    } catch (error) {
        next(error);
    }
});

// Delete a user by id.
userRoutes.route("/app/user/delete/:id").delete(async (req, res, next) => {
    const profileId = req.params.id;
    const queryText = 'DELETE FROM Profile WHERE profile_id = $1 RETURNING *';

    try {
        const { rows } = await pool.query(queryText, [profileId]);
        if (rows.length > 0) {
            res.status(200).json({
                message: "Successfully deleted profile",
                data: rows[0]
            });
        } else {
            res.status(404).json({
                message: "Profile not found",
                id: profileId
            });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = userRoutes;