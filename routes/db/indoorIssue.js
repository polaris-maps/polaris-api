const express = require("express");
const multer = require("multer");

// In memory storage with multer 
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// indoorIssueRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /app/indoorIssue.
const indoorIssueRoutes = express.Router();

// This will help us connect to the database
const pool = require("../../connections/pool");

// Get a list of all the indoorIssues.
indoorIssueRoutes.get("/app/indoorIssue/all", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Issue');
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Get a list of all the indoorIssues of specific categories.
indoorIssueRoutes.route("/app/indoorIssue/filtered").post(async (req, res, next) => {
    try {
        const categories = req.body.category;
        const placeholders = categories.map((_, index) => `$${index + 1}`).join(', ');

        const queryText = `
            SELECT Issue.*
            FROM Issue
            JOIN IssuesAndCategories ON Issue.issue_id = IssuesAndCategories.issue_id
            WHERE IssuesAndCategories.category IN (${placeholders});
        `;

        const { rows } = await pool.query(queryText, categories);
        res.json(rows);
    } catch (error) {
        next(error);
    }
});

// Get a single indoorIssue by id
indoorIssueRoutes.get("/app/indoorIssue/:id", async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Issue WHERE issue_id = $1', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Issue not found');
        }
    } catch (error) {
        next(error);
    }
});

// Create a new indoorIssue.
indoorIssueRoutes.route("/app/indoorIssue/add").post(upload.single('image'), async (req, res, next) => {
    const { avoidPolygon, location, latitude, longitude, description, status, datetimeOpen, datetimeClosed, datetimePermanent, votes } = req.body;

    let imageEncoded = null;

    if (req.file) {
        // Encode the image to Base64
        imageEncoded = req.file.buffer.toString('base64');
    }
    
    const queryText = `
        INSERT INTO Issue(avoidPolygon, location, latitude, longitude, description, status, datetimeOpen, datetimeClosed, datetimePermanent, votes, image)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
    `;

    try {
        const { rows } = await pool.query(queryText, [avoidPolygon, location, latitude, longitude, description, status, datetimeOpen, datetimeClosed, datetimePermanent, votes || 0, imageEncoded]);
        res.status(200).json({
            message: "Successfully added indoor issue",
            data: rows[0]
        });
    } catch (error) {
        next(error);
    }
});

// Update an indoorIssue by id.
indoorIssueRoutes.route("/app/indoorIssue/update/:id").patch(upload.single('image'), async (req, res, next) => {
    const issueId = req.params.id;
    const updates = req.body;
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    if (req.file) {
        updates.image = req.file.buffer.toString('base64');
        keys.push('image');
        values.push(updates.image);
    }

    const setClause = keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ');

    const queryText = `UPDATE Issue SET ${setClause} WHERE issue_id = $1 RETURNING *`;

    try {
        const { rows } = await pool.query(queryText, [issueId, ...values]);
        if (rows.length > 0) {
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
// Delete an indoorIssue by id.
indoorIssueRoutes.route("/app/indoorIssue/delete/:id").delete(async (req, res, next) => {
    const issueId = req.params.id;
    const queryText = `DELETE FROM Issue WHERE issue_id = $1 RETURNING *`;

    try {
        const { rows } = await pool.query(queryText, [issueId]);
        if (rows.length > 0) {
            res.status(200).json({
                message: "Successfully deleted indoor issue",
                data: rows[0]
            });
        } else {
            res.status(404).json({
                message: "Indoor issue not found",
                id: issueId
            });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = indoorIssueRoutes;