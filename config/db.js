var levelup = require('levelup');
var ttl = require('level-ttl');
var dbupdate = require('./dbupdate.js');
var db = dbupdate(levelup('/tmp/lvldbtmp.db',{valueEncoding:'json'}));
var db = ttl(db);

module.exports = db;
