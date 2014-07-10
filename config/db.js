var path = require('path');

var dbpath = (process.env.DBPATH || path.join(__dirname,'../lvlauth.db'))

var levelup = require('levelup');
var ttl = require('level-ttl');
var dbupdate = require('./dbupdate.js');
var db = dbupdate(levelup(dbpath,{valueEncoding:'json'}));
var db = ttl(db);

module.exports = db;
