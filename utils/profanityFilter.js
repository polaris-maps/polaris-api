const Filter = require('bad-words');
const filter = new Filter();

function censorAllProfanity(text) {
  return filter.clean(text);
}

module.exports = { censorAllProfanity };
