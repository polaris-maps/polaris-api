const express = require("express");

// apiLogRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/apiLog.
const apiLogRoutes = express.Router();

// This will help us connect to the database
const pool = require("../../connections/building");

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
        const { rows } = await pool.query('Select * From ApiLog where api_log_id = id');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

module.exports = apiLogRoutes;