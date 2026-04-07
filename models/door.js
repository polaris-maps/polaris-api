/**
 * Door Data Model
 * Provides Mongoose-style query interface for PostgreSQL door data
 * Used by adaptiveNav.js for navigation queries
 */

const pool = require('../connections/pool');

/**
 * Find doors matching the given criteria
 * @param {Object} criteria - Query criteria (building, emergency, stairs, automatic, etc.)
 * @param {Function} callback - Callback function (error, results)
 */
function find(criteria, callback) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Build WHERE conditions dynamically based on criteria
    if (criteria.building !== undefined) {
        conditions.push(`building = $${paramIndex}`);
        values.push(criteria.building);
        paramIndex++;
    }

    if (criteria.emergency !== undefined) {
        conditions.push(`is_emergency = $${paramIndex}`);
        values.push(criteria.emergency);
        paramIndex++;
    }

    if (criteria.stairs !== undefined) {
        // The adaptiveNav code already sets stairs: false when exclude_stairs is true
        // So we just use the value directly
        conditions.push(`stairs = $${paramIndex}`);
        values.push(criteria.stairs);
        paramIndex++;
    }

    if (criteria.automatic !== undefined) {
        conditions.push(`automatic = $${paramIndex}`);
        values.push(criteria.automatic);
        paramIndex++;
    }

    if (criteria.is_indoor !== undefined) {
        conditions.push(`is_indoor = $${paramIndex}`);
        values.push(criteria.is_indoor);
        paramIndex++;
    }

    if (criteria.is_service !== undefined) {
        conditions.push(`is_service = $${paramIndex}`);
        values.push(criteria.is_service);
        paramIndex++;
    }

    let queryText = 'SELECT * FROM Door';
    if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
    }

    pool.query(queryText, values)
        .then(result => {
            callback(null, result.rows);
        })
        .catch(error => {
            callback(error, null);
        });
}

/**
 * Find a single door by ID
 * @param {number} id - Door ID
 * @param {Function} callback - Callback function (error, result)
 */
function findById(id, callback) {
    pool.query('SELECT * FROM Door WHERE door_id = $1', [id])
        .then(result => {
            callback(null, result.rows[0] || null);
        })
        .catch(error => {
            callback(error, null);
        });
}

/**
 * Find doors by building ID
 * @param {number} buildingId - Building ID
 * @param {Function} callback - Callback function (error, results)
 */
function findByBuilding(buildingId, callback) {
    pool.query('SELECT * FROM Door WHERE building = $1', [buildingId])
        .then(result => {
            callback(null, result.rows);
        })
        .catch(error => {
            callback(error, null);
        });
}

/**
 * Promise-based find method
 * @param {Object} criteria - Query criteria
 * @returns {Promise<Array>} - Array of door records
 */
function findAsync(criteria) {
    return new Promise((resolve, reject) => {
        find(criteria, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = {
    find,
    findById,
    findByBuilding,
    findAsync
};
