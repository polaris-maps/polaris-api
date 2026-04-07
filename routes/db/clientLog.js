const express = require("express");

// clientLogRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/clientLog.
const clientLogRoutes = express.Router();

// This will help us connect to the database
const pool = require("../../connections/pool");
const { censorAllProfanity } = require("../../utils/profanityFilter");

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
        const { rows } = await pool.query('SELECT * FROM ClientLog WHERE client_log_id = $1', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Client log not found' });
        }
    } catch (error) {
        next(error);
    }
});

// Create a new clientLog.
clientLogRoutes.post("/app/log/add", async (req, res, next) => {
    try {
        const { log_timestamp, log_level, log_message, file_name, line_number, column_number, additional } = req.body;

        const filteredLogMessage = log_message ? censorAllProfanity(log_message) : log_message;
        // Stringify additional if it's an object, then apply profanity filter
        let additionalStr = additional;
        if (additional && typeof additional === 'object') {
            additionalStr = JSON.stringify(additional);
        }
        const filteredAdditional = additionalStr ? censorAllProfanity(additionalStr) : additionalStr;

        const { rows } = await pool.query(
            'INSERT INTO ClientLog (log_timestamp, log_level, log_message, file_name, line_number, column_number, additional) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [log_timestamp, log_level, filteredLogMessage, file_name, line_number, column_number, filteredAdditional]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
});

module.exports = clientLogRoutes;