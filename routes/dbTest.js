const express = require('express');
const { Pool } = require('pg');
const dotEnv = require('dotenv');

dotEnv.config({ path: './config.env' });  // Make sure your .env file is configured correctly

const dbTestRoutes = express.Router();

// PostgreSQL connection setup using Pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Route to test the database connection
dbTestRoutes.get('/app/test-db', async (req, res, next) => {
    try {
        const client = await pool.connect();  // try to get connection from the pool
        const result = await client.query('SELECT NOW()');  // simple query to test the connection
        client.release();  // release the connection back to the pool
        res.json({
            message: 'Connected to the PostgreSQL database successfully.',
            time: result.rows[0].now  // display the current time from the database
        });
    } catch (error) {
        console.error('Failed to connect to the database.', error);
        return next(error);
    }
});

module.exports = dbTestRoutes;
