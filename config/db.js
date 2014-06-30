var levelup = require('levelup');
var dbupdate = require('./dbupdate.js')
var db = dbupdate(levelup('/tmp/lvldbtmp.db',{valueEncoding:'json'}))

module.exports = db;
