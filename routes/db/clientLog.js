const express = require("express");

// clientLogRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/clientLog.
const clientLogRoutes = express.Router();

// This will help us connect to the database
const pool = require("../../connections/pool");

// Get a list of all the client log records.
clientLogRoutes.get("/app/clientlog/all", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM ClientLog');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Get a single client log record by id
clientLogRoutes.get("/app/clientlog/:id", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM ClientLog WHERE client_log_id = id');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Create a new clientLog.
clientLogRoutes.post("/app/log/add", async (req, res, next) => {
    try {
        // Can add current timestamp in default SQL
        const { log_timestamp, log_level, log_message, file_name, line_number, column_number, additional } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO ClientLog (log_timestamp, log_level, log_message, file_name, line_number, column_number, additional) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
            [log_timestamp, log_level, log_message, file_name, line_number, column_number, additional]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
});

module.exports = clientLogRoutes;