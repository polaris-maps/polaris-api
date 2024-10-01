const express = require("express");

// rampRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/ramp.
const rampRoutes = express.Router();

// This will help us connect to the database
const pool = require("../../connections/pool");

// Get a list of all the ramps.
rampRoutes.route("/app/ramp/all").get(async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Ramp');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Get a single ramp by id
rampRoutes.route("/app/ramp/:id").get(async (req, res, next) => {
    try {
        const rampId = req.params.id;
        const { rows } = await pool.query('SELECT * FROM Ramp WHERE ramp_id = $1', [rampId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Ramp not found" });
        }
    } catch (error) {
        next(error);
    }
});

// Create a new ramp.
rampRoutes.route("/app/ramp/add").post(async (req, res, next) => {
    const { latitude, longitude, building } = req.body;
    const queryText = 'INSERT INTO Ramp (latitude, longitude, building) VALUES ($1, $2, $3) RETURNING *';
    
    try {
        const { rows } = await pool.query(queryText, [latitude, longitude, building]);
        res.status(200).json({
            message: "Successfully added ramp",
            data: rows[0]
        });
    } catch (error) {
        next(error);
    }
});

// Create multiple new ramps.
rampRoutes.route("/app/ramp/add/multiple").post(async (req, res, next) => {
    const ramps = req.body; // Assuming this is an array of ramp objects
    const queryText = 'INSERT INTO Ramp (latitude, longitude, building) VALUES ';

    const queryParams = [];
    ramps.forEach(ramp => {
        const valuesClause = '($1, $2, $3)';
        queryParams.push(valuesClause, ramp.latitude, ramp.longitude, ramp.building);
    });

    const valuesText = queryParams.map((_, i) => `$${i + 1}`).join('), (');

    try {
        const { rows } = await pool.query(queryText + valuesText, queryParams);
        res.status(200).json({
            message: "Successfully added multiple ramps",
            data: rows
        });
    } catch (error) {
        next(error);
    }
});


// Update an ramp by id.
rampRoutes.route("/app/ramp/update/:id").patch(async (req, res, next) => {
    const rampId = req.params.id;
    const updates = req.body;
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');

    const queryText = `UPDATE Ramp SET ${setClause} WHERE ramp_id = $1 RETURNING *`;

    try {
        const { rows } = await pool.query(queryText, [rampId, ...values]);
        if (rows.length > 0) {
            res.status(200).json({
                message: "Successfully updated ramp",
                data: rows[0]
            });
        } else {
            res.status(404).json({ message: "Ramp not found" });
        }
    } catch (error) {
        next(error);
    }
});

// Delete an ramp by id.
rampRoutes.route("/app/ramp/delete/:id").delete(async (req, res, next) => {
    const rampId = req.params.id;
    const queryText = 'DELETE FROM Ramp WHERE ramp_id = $1 RETURNING *';

    try {
        const { rows } = await pool.query(queryText, [rampId]);
        if (rows.length > 0) {
            res.status(200).json({
                message: "Successfully deleted ramp",
                data: rows[0]
            });
        } else {
            res.status(404).json({
                message: "Ramp not found",
                id: rampId
            });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = rampRoutes;