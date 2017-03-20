/*
 * Dynamic config
 */

module.exports = process.env.NODE_ENV === 'test'
  ? require('./config.test.json')
  : require('./config.json');
