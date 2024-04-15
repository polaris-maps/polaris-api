const express = require('express');
const { Pool } = require('pg');
const dotEnv = require('dotenv');

dotEnv.config({ path: './config.env' }); 

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
        const client = await pool.connect();  
        const result = await client.query('SELECT NOW()'); 
        client.release(); 
        res.json({
            message: 'Connected to the PostgreSQL database successfully.',
            time: result.rows[0].now 
        });
    } catch (error) {
        console.error('Failed to connect to the database.', error);
        return next(error);
    }
});

module.exports = dbTestRoutes;
