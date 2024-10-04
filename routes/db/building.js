const express = require("express");
const router = express.Router();
const pool = require("../../connections/pool");
const pg = require('pg');
const types = pg.types;

types.setTypeParser(1700, function (val){
  return val === null ? null : parseFloat(val);
});

// Get a list of all the locations.
router.get("/app/building/all", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Location');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Get a single location by id
router.get("/app/building/:id", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Location WHERE location_id = $1', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Location not found');
        }
    } catch (error) {
        next(error);
    }
});

// Create a new location.
router.post("/app/building/add", async (req, res, next) => {
    try {
        const { full_name, abbreviation, defaultLatitude, defaultLongitude, campus_id, geo_address } = req.body;
        const { rows } = await pool.query('INSERT INTO Location (full_name, abbreviation, defaultLatitude, defaultLongitude, campus_id, geo_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [full_name, abbreviation, defaultLatitude, defaultLongitude, campus_id, geo_address]);
        res.status(201).json(rows[0]);
    } catch (error) {
        next(error);
    }
});

// Update a location by id.
router.patch("/app/building/update/:id", async (req, res, next) => {
    try {
        const keys = Object.keys(req.body);
        const values = Object.values(req.body);
        const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

        const { rows } = await pool.query(`UPDATE Location SET ${setClause} WHERE location_id = $1 RETURNING *`, [req.params.id, ...values]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Location not found');
        }
    } catch (error) {
        next(error);
    }
});

// Delete a location by id.
router.delete("/app/building/delete/:id", async (req, res, next) => {
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

module.exports = router;
