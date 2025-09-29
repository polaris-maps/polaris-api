const { censorAllProfanity } = require('../utils/profanityFilter');

describe('Profanity Filter Integration Tests', () => {
    test('should filter profanity in indoor issue description', () => {
        const testDescription = 'This damn door is shit and needs fixing';
        const filtered = censorAllProfanity(testDescription);
        expect(filtered).toBe('This **** door is **** and needs fixing');
    });

    test('should filter profanity in location names', () => {
        const testLocation = 'Fucking bathroom near the library';
        const filtered = censorAllProfanity(testLocation);
        expect(filtered).toBe('******* bathroom near the library');
    });

    test('should filter profanity in QnA content', () => {
        const testQnA = 'Q: Why is this shit broken? A: Because it\'s a damn old system';
        const filtered = censorAllProfanity(testQnA);
        expect(filtered).toBe('Q: Why is this **** broken? A: Because it\'s a **** old system');
    });

    test('should filter profanity in log messages', () => {
        const testLogMessage = 'Error: This fucking API call failed';
        const filtered = censorAllProfanity(testLogMessage);
        expect(filtered).toBe('Error: This ******* API call failed');
    });

    test('should filter profanity in building names', () => {
        const testBuildingName = 'The Hell House dormitory';
        const filtered = censorAllProfanity(testBuildingName);
        expect(filtered).toBe('The **** House dormitory');
    });

    test('should handle empty and null values gracefully', () => {
        expect(censorAllProfanity('')).toBe('');
        expect(censorAllProfanity(null)).toBe(null);
        expect(censorAllProfanity(undefined)).toBe(undefined);
    });

    test('should preserve clean text unchanged', () => {
        const cleanText = 'This is a perfectly clean description of an accessibility issue';
        const filtered = censorAllProfanity(cleanText);
        expect(filtered).toBe(cleanText);
    });

    test('should handle mixed profanity and clean content', () => {
        const mixedText = 'The elevator is broken damn it, please fix this shit ASAP';
        const filtered = censorAllProfanity(mixedText);
        expect(filtered).toBe('The elevator is broken **** it, please fix this **** ASAP');
    });
});
