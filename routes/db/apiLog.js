const express = require("express");

// apiLogRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/apiLog.
const apiLogRoutes = express.Router();

// This will help us connect to the database
const pool = require("../../connections/pool");

// Get a list of all the api log records.
apiLogRoutes.get("/app/apiLog/all", async (req, res, next) => {
    try {
        const { rows } = await pool.query('Select * From ApiLog');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Get a single api log record by id
apiLogRoutes.get("/app/apiLog/:id", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM ApiLog WHERE api_log_id = $1', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'API log not found' });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = apiLogRoutes;