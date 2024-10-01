const express = require("express");

// doorRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/door.
const doorRoutes = express.Router();

// This will help us connect to the database
const pool = require("../../connections/pool");

// Get a list of all the doors.
doorRoutes.get("/app/door/all", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Door');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Get a list of all the doors of a specific building.
doorRoutes.get("/app/door/filtered/:buildingId", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Door WHERE building_id = id', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Location not found');
        }
    } catch (error) {
        next(error);
    }
});

// Get a single door by id
doorRoutes.get("/app/door/filtered/:buildingId", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Door WHERE door_id = id', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Location not found');
        }
    } catch (error) {
        next(error);
    }
});

// Create a new door.
doorRoutes.post("/app/door/add", async (req, res, next) => {
    try {
        const { node_id, latitude, longitude, building_id, is_indoor, is_emergency, is_service } = req.body;
        const queryText = `
            INSERT INTO Door (node_id, latitude, longitude, building_id, is_indoor, is_emergency, is_service) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
        `;
        const values = [node_id, latitude, longitude, building_id, is_indoor, is_emergency, is_service];
        const { rows } = await pool.query(queryText, values);
        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
});

// Create multiple new doors.
doorRoutes.post("/app/door/add/multiple", async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); 
        const insertPromises = req.body.map(door => {
            const { node_id, latitude, longitude, building_id, is_indoor, is_emergency, is_service } = door;
            const queryText = `
                INSERT INTO Door (node_id, latitude, longitude, building_id, is_indoor, is_emergency, is_service)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
            `;
            return client.query(queryText, [node_id, latitude, longitude, building_id, is_indoor, is_emergency, is_service]);
        });

        const results = await Promise.all(insertPromises);
        await client.query('COMMIT'); 

        const insertedDoors = results.map(result => result.rows[0]);
        res.status(200).json({
            message: "Successfully added multiple doors",
            data: insertedDoors
        });
    } catch (error) {
        await client.query('ROLLBACK'); 
        next(error);
    } finally {
        client.release(); 
    }
});

doorRoutes.patch("/app/door/update/:id", async (req, res, next) => {
    try {
        const doorId = req.params.id;
        const updates = req.body;
        const keys = Object.keys(updates);
        const values = Object.values(updates);

        const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');
        const queryText = `UPDATE Door SET ${setClause} WHERE door_id = $1 RETURNING *`;

        const { rows } = await pool.query(queryText, [doorId, ...values]);
        if (rows.length > 0) {
            res.status(200).json({
                message: "Successfully updated door",
                data: rows[0]
            });
        } else {
            res.status(404).json({ message: "Door not found" });
        }
    } catch (error) {
        next(error);
    }
});

// Delete an door by id.
doorRoutes.delete("/app/door/delete/:id", async (req, res, next) => {
    try {
        const { rows } = await pool.query('DELETE FROM Location WHERE location_id = $1 RETURNING *', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Location not found');
        }
    } catch (error) {
        next(error);
    }
});

module.exports = doorRoutes;