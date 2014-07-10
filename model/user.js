var levelup = require('levelup');
//var db = levelup('/tmp/lvldbtmp.db',{valueEncoding:'json'});
var db = require('../config/db.js');
var pass = require('pwd');

var userUtils=[]


//var done = function(){}

userUtils.addUser = function(username,password) {
	console.log('this is the user model',username,password)
}


userUtils.testPwd = function (username,password) {
	var user = username
	console.log('testPwd method\nusername: %s and password: %s',  user ,password)
	return done(null,user);
}

/*
(get user, then callback get hash)
(get hash, then callback get salt)
(get salt, then callback is validated)
*/


userUtils.validatePwd = function (username,password) {
		db.get(username + ':username', function(err, value){
			if (err){
			  if (err.notFound) {
				//return console.log('not found',username);
				return done(null,false) && console.log('not found',username);
				//return done(err);
				}
			  //some other error
			  return done(null,false) && console.log('IO error',err);
			  //return done(err);
			};
			uname = value;
			//console.log('uname is: ' + uname);
			db.get(username + ':pwdhash', function (err, value) {
				if (err) {
				  if (err.notFound) {
					//console.log(username + ' not found');
					return done(null,false) && console.log('password hash not found',value);
					}
				return done(null,false) && console.log('IO error',err);
				  };
				pwdhash = value;
				db.get(username + ':pwdsalt', function (err, value) {
					if (err) { 
					  if (err.notFound) { 
					    return done(null,false) && console.log('password salt not found',value); }
					    return done(null,false) && console.log('IO Error',err); 
					}
					  pwdsalt = value;
					  pass.hash(password, pwdsalt, function (err,hash) {
						if (pwdhash == hash ) { 
							console.log('password works');
							//response.json(200,username);
							return	done(null,uname);
							}
						else { 
							//response.send(403)
							console.log('password failed')
							return done(null,false);
							};
					   }) // /pass.hash
				 }) // /db.get - salt
			  }) // /db.get - hash
		}) // /db.get - username
	} // /validatePwd
		//validatePwd(username,password);

function getUser(username,complete) { 
	//db.get(username + ':username', function doneGetting(err, data) {
	db.get('asdf:username', function doneGetting(err, data) {
		if (err) {
			if (err.notFound) {
				return console.log('Key not found', err);
				};
			return console.error('Some IO Error', err);
			};
		dbuser = data;
		console.log('the db user is', dbuser);
		complete();
		});
}

function validateUser(){
	if (dbuser === 'asdf') {
		console.log('wow - this might work')
		return done(null,dbuser)
		}
	else {
		console.log('youre stuipd for thinkin this way')
		return done(null,false)
	}
}

//userUtils.awesome = getUser(validateUser)
function isValidated() {
	if (validated === true) { 
		console.log('user is validated',validated)
		}
	else {
		console.log('user is not validated',validated)
	}
}

//userUtils.awesome = userUtils.validatePwd('User',isValidated);

module.exports = userUtils
