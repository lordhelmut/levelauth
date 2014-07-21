var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var User = require('../model/user');
var configAuth = require('./auth.js');
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
	});

	passport.use(new TwitterStrategy({

	passReqToCallback : true,
        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL
	},
	function(req, token, tokenSecret, profile, done) {
		
		//console.log('the token is', token)
		//console.log('the twitter id is', profile.id)
		//console.log('the name is ', profile.displayName)

		// need to check for data, and then put the data if it doesn't exist.
		db.get(req.user + ':twitter-token', function (err, value) {
			if (err){
			  if (err.notFound) {
				db.put(req.user + ':twitter-token',  token, function(err) {
				if (err) console.log(err);
				return console.log('added user twitter tokens');
				})
				//console.log('Twitter token not found:',req.user);
				//return;
				}
			  //some other error
			  console.log('IO error',err);
			};
		})

		/*
	  // make the code asynchronous
	  // User.findOne won't fire until we have all our data back from Twitter
	  process.nextTick(function() {
			User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
				// if there is an error, stop everything and return that
				// ie an error connecting to the database
			    if (err)
				return done(err);
				// if the user is found then log them in
			    if (user) {
				return done(null, user); // user found, return that user
			    } else {
				// if there is no user, create them
				var newUser                 = new User();
				// set all of the user data that we need
				newUser.twitter.id          = profile.id;
				newUser.twitter.token       = token;
				newUser.twitter.username    = profile.username;
				newUser.twitter.displayName = profile.displayName;
				// save our user into the database
				newUser.save(function(err) {
				    if (err)
					throw err;
				    return done(null, newUser);
				});
			    }
			});
		});
		*/	

	    }));

	passport.use('local-login', new LocalStrategy({
		passReqToCallback : true
		},
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
								//console.log('password works');
								req.session.username = uname;
								return	done(null,uname);
								}
							else { 
								console.log('Password failed attempt for', uname)
								return done(null,false);
								};
						   }) // /pass.hash
					 }) // /db.get - salt
				  }) // /db.get - hash
			}) // /db.get - username
		} // /validatePwd
			validatePwd(username,password);
	
			//User.testPwd(username,password);
			//return done(null,'asdf');
	})) // /passport.use
}; // /module.exports
