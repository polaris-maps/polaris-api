const { censorAllProfanity } = require('../utils/profanityFilter');

test('censors a single profane word', () => {
  expect(censorAllProfanity('shit')).toBe('****');
});

test('censors multiple profanities', () => {
  expect(censorAllProfanity('shit damn')).toBe('**** ****');
});

test('leaves clean text unchanged', () => {
  expect(censorAllProfanity('hello world')).toBe('hello world');
});
