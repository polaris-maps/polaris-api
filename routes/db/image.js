const express = require("express");

const imageRoutes = express.Router();

const pool = require("../../connections/pool");

imageRoutes.get("/app/image/get/:pictureId", async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM Image WHERE picture_id = $1',
            [req.params.pictureId]
        );
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: "Image not found" });
        }
    } catch (error) {
        next(error);
    }
});

imageRoutes.post("/app/image/add", async (req, res, next) => {
    try {
        const { picture_id, base64 } = req.body;
        const queryText = `
            INSERT INTO Image (picture_id, data) 
            VALUES ($1, $2)
            RETURNING *
        `;
        const { rows } = await pool.query(queryText, [picture_id, base64]);
        res.status(201).json({
            message: "Image added successfully",
            data: rows[0]
        });
    } catch (error) {
        next(error);
    }
});

module.exports = imageRoutes;
