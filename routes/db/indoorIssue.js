const express = require("express");
const indoorIssueRoutes = express.Router();
const pool = require("../../connections/pool");

// Get all indoor issues.
indoorIssueRoutes.get("/app/indoorIssue/all", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Issue');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Filter indoor issues by categories.
indoorIssueRoutes.post("/app/indoorIssue/filtered", async (req, res, next) => {
    try {
        const categories = req.body.category; // expecting an array of strings
        const placeholders = categories.map((_, i) => `$${i + 1}`).join(', ');
        const queryText = `
      SELECT *
      FROM Issue
      WHERE categories && ARRAY[${placeholders}]::text[];
    `;
        const { rows } = await pool.query(queryText, categories);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Create a new indoor issue with categories.
indoorIssueRoutes.post("/app/indoorIssue/add", async (req, res, next) => {
    const {
        avoidPolygon, location, latitude, longitude, description,
        status, datetimeOpen, datetimeClosed, datetimePermanent,
        votes, image, categories
    } = req.body;

    const queryText = `
    INSERT INTO Issue(
      avoidPolygon, location, latitude, longitude, description,
      status, datetimeOpen, datetimeClosed, datetimePermanent,
      votes, image, categories
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;

    try {
        const { rows } = await pool.query(queryText, [
            avoidPolygon, location, latitude, longitude, description,
            status, datetimeOpen, datetimeClosed, datetimePermanent,
            votes || 0, image, categories
        ]);
        res.status(200).json({
            message: "Successfully added indoor issue",
            data: rows[0]
        });
    } catch (error) {
        next(error);
    }
});

// Get a single indoor issue by id.
indoorIssueRoutes.get("/app/indoorIssue/get/:id", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Issue WHERE issue_id = $1', [req.params.id]);
        if (rows.length) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Issue not found');
        }
    } catch (error) {
        next(error);
    }
});

// Update an indoor issue by id.
indoorIssueRoutes.patch("/app/indoorIssue/update/:id", async (req, res, next) => {
    const issueId = req.params.id;
    const updates = req.body;
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
    const queryText = `UPDATE Issue SET ${setClause} WHERE issue_id = $1 RETURNING *`;

    try {
        const { rows } = await pool.query(queryText, [issueId, ...values]);
        if (rows.length) {
            res.status(200).json({
                message: "Successfully updated indoor issue",
                data: rows[0]
            });
        } else {
            res.status(404).json({ message: "Indoor issue not found" });
        }
    } catch (error) {
        next(error);
    }
});

// Delete an indoor issue by id.
indoorIssueRoutes.delete("/app/indoorIssue/delete/:id", async (req, res, next) => {
    const issueId = req.params.id;
    const queryText = `DELETE FROM Issue WHERE issue_id = $1 RETURNING *`;

    try {
        const { rows } = await pool.query(queryText, [issueId]);
        if (rows.length) {
            res.status(200).json({
                message: "Successfully deleted indoor issue",
                data: rows[0]
            });
        } else {
            res.status(404).json({ message: "Indoor issue not found", id: issueId });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = indoorIssueRoutes;
