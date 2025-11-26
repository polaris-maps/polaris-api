const Filter = require('bad-words');
const filter = new Filter();

function censorAllProfanity(text) {
  if (text === null || text === undefined) {
    return text;
  }
  
  if (typeof text !== 'string') {
    text = String(text);
  }
  
  if (text === '') {
    return text;
  }
  
  return filter.clean(text);
}

module.exports = { censorAllProfanity };
