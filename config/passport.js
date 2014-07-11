var LocalStrategy = require('passport-local').Strategy;
var User = require('../model/user');
var db = require('../config/db.js');
var pass= require('pwd');

module.exports = function(passport) {
	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		db.get(id+':username', function (err, user) {
			//console.log('dersierilzie err: ' + err + ' user: ' + user)
			done (err, user) 
			});
		//User.findById(id, function(err, user) {
		//    done(err, user);
		//});
	});

	passport.use('local-login', new LocalStrategy({
		// dont this this is what im looking for
		// usernameField : XXX:username
		// passwordFiedl : XXX:pwdhash
		passReqToCallback : true
		},
		//function (req , username, password, done) {
		function (req , username, password, done) {
			var username = req.body.username;
			var password = req.body.password;
			if (req.body.rememberme) {
			  req.session.cookie.maxAge = 3600000 * 24 * 30 + 17 * 3600000
			  } else {
				req.session.cookie.expires = false;
			  	};
	
			validatePwd = function (username,password) {
			db.get(username + ':username', function(err, value){
				if (err){
				  if (err.notFound) {
					console.log('User not found:',username);
					//return done(null,false);
					return done(null,false);
					}
				  //some other error
				  console.log('IO error',err);
				  return done(null,false) ; 
				};
				uname = value;
				db.get(username + ':pwdhash', function (err, value) {
					if (err) {
					  if (err.notFound) {
						console.log('Password hash not found for user:',uname)
						return done(null,false);
						}
					return done(null,false) && console.log('IO error',err);
					  };
					pwdhash = value;
					db.get(username + ':pwdsalt', function (err, value) {
						if (err) { 
						  if (err.notFound) {
						    console.log('Password salt not found for user:',uname) 
						    return done(null,false);
						}
						    console.log('IO Error',err);
						    return done(null,false);
						}
						  pwdsalt = value;
						  pass.hash(password, pwdsalt, function (err,hash) {
							if (pwdhash == hash ) { 
								console.log('password works');
								req.session.username = uname;
								return	done(null,uname);
								}
							else { 
								console.log('password failed')
								return done(null,false);
								};
						   }) // /pass.hash
					 }) // /db.get - salt
				  }) // /db.get - hash
			}) // /db.get - username
		} // /validatePwd
			validatePwd(username,password);
	
			//User.testPwd(username,password);
			//User.awesome(username,password);
			//return done(null,'asdf');
			//return done(null,false,{error:'usuk'});
			//return done(null,false)
	})) // /passport.use
}; // /module.exports
