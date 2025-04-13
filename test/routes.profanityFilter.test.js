const request = require('supertest');
const express = require('express');

// Mock the database pool to avoid needing actual database connection for testing
jest.mock('../../connections/pool', () => ({
    query: jest.fn()
}));

const pool = require('../../connections/pool');
const indoorIssueRoutes = require('../../routes/db/indoorIssue');

const app = express();
app.use(express.json());
app.use(indoorIssueRoutes);

describe('Indoor Issue Routes with Profanity Filter', () => {
    beforeEach(() => {
        pool.query.mockClear();
    });

    test('POST /app/indoorIssue/add should filter profanity in description', async () => {
        // Mock successful database insertion
        pool.query.mockResolvedValue({
            rows: [{
                issue_id: 1,
                description: '**** elevator broken',
                location: 'Library **** floor',
                qna: 'Q: Why is this ****? A: Old system'
            }]
        });

        const response = await request(app)
            .post('/app/indoorIssue/add')
            .send({
                description: 'shit elevator broken',
                location: 'Library damn floor',
                qna: 'Q: Why is this shit? A: Old system',
                latitude: 40.7128,
                longitude: -74.0060,
                status: 'open'
            });

        expect(response.status).toBe(200);
        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining([
                expect.any(String), // avoidPolygon
                'Library **** floor', // filtered location
                40.7128, // latitude
                -74.0060, // longitude
                '**** elevator broken', // filtered description
                'open', // status
                expect.any(String), // datetimeOpen
                expect.any(String), // datetimeClosed
                expect.any(String), // datetimePermanent
                0, // votes
                expect.any(String), // image
                expect.any(String), // categories
                'Q: Why is this ****? A: Old system' // filtered qna
            ])
        );
    });

    test('PATCH /app/indoorIssue/update/:id should filter profanity in updates', async () => {
        // Mock successful database update
        pool.query.mockResolvedValue({
            rows: [{
                issue_id: 1,
                description: '**** elevator still broken'
            }]
        });

        const response = await request(app)
            .patch('/app/indoorIssue/update/1')
            .send({
                description: 'shit elevator still broken'
            });

        expect(response.status).toBe(200);
        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining([
                1,
                '**** elevator still broken'
            ])
        );
    });
});
