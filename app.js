/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var pass = require('pwd');

var levelup  = require('levelup');
var db = require('./config/db.js');
var passport = require('passport');
require('./config/passport.js')(passport);
var LevelStore = require('connect-leveldb')(express);
var secureCookie = false;
var helmet = require('helmet');

// causing issues with forms ATM ... will work on this.  
/*
// from http://www.mircozeiss.com/using-csrf-with-express-and-angular/
var csrfValue = function(req) {
  var token = (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['x-csrf-token'])
    || (req.headers['x-xsrf-token']);
  console.log('angularjs token is', req.headers['x-xsrf-token']);
  console.log('csrf token is', req.headers['x-csrf-token']);
  console.log('req.body._csrf is', req.body._csrf);
  console.log('req.query._csrf is', req.query._csrf);
  return token;
};
*/

var app = express();

// all environments
app.set('port', process.env.PORT || 30000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.cookieParser());
app.use(express.session({ 
	//key:'BTCIN',
	//proxy: true, //this should be set at the express level ... but just in case
	saveUninitialized: false,
	secret: 'thisismysecrettherearemanylikeitbutthisoneismine', 
	cookie:{ 
		//path:'/',
		secure: secureCookie
		//maxAge: 3600000 * 24 * 30 + 17 * 3600000
		},
	store: new LevelStore({
		dbLocation: path.join(db.location,'sessions'),
		//ttl: 5,
		prefix: 'SESSION:'
	}),
}));
app.use(passport.initialize());
app.use(passport.session());
//app.use(express.csrf({value:csrfValue}));
app.use(express.logger('dev'));
app.use(express.bodyParser());
//app.use(helmet()); //this will turn on all options to defaults - w/out csp
/*
// customize this for your domain
app.use(helmet.csp({
  defaultSrc: ["'self'", 'default.com'],
  scriptSrc: ['scripts.com'],
  styleSrc: ['style.com'],
  imgSrc: ['img.com'],
  connectSrc: ['connect.com'],
  fontSrc: ['font.com'],
  objectSrc: ['object.com'],
  mediaSrc: ['media.com'],
  frameSrc: ['frame.com'],
  sandbox: ['allow-forms', 'allow-scripts'],
  reportUri: '/report-violation',
  reportOnly: false, // set to true if you only want to report errors
  setAllHeaders: false, // set to true if you want to set all headers
  safari5: false // set to true if you want to force buggy CSP in Safari 5
	}));

//app.use(helmet.nocache()); //optional - forces full page reloads eg Cache-control and Pragma headers said it has expired.  Caching may have benefits for your app, especially if using Single page framework (AngularJS).
*/
app.use(helmet.xssFilter());
app.use(helmet.xframe('sameorigin'));
app.use(helmet.ienoopen());
app.use(helmet.nosniff());
app.use(helmet.crossdomain());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');

/*
app.use(function(req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});
*/

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// production
if ('production' == app.get('env')) {
	app.set('trust proxy', true)
	secureCookie = true;
}

// redirect to menu 
app.get('/', function(req, res) {
  res.redirect('/menu');
});

var readStream = db.createReadStream();
	//.on('data',function (entry) { entries.push(entry)})
	//.on('close',function() {console.log(entries)})
var keyStream = db.createKeyStream();

var entries = []

function rsON() {
	readStream.on('data',function (entry) { entries.push(entry)})
	};

function splitter(data) {
	return data.split(":",1).toString();
	};

function adder(data) {
	return data.toString() + ':username';
	};

// render signup page
app.get('/signup', function(req, res) {
  res.render('signup');
});

// render signup page
app.get('/settings', function(req, res) {
  if (req.session.username === undefined || req.user === undefined) res.redirect('/menu');
  else { res.render('settings') }
});

app.get('/api/users', function(req, res) {
  if (req.session.username === undefined) {
	res.json(404);
  	}
  else {
	res.json({ loggedOnUser: req.user }
	)}
});

app.get('/auth/twitter', passport.authenticate('twitter')); 
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successRedirect : '/settings',
		failureRedirect : '/menu'
		}));
  
app.get('/logout', function(req, res) {
	delete req.session.username;
	delete req.user;
	res.redirect('/menu');
});

// render menu page
app.get('/menu', function(req, res) {
  res.render('menu');
});

// render menu page
app.get('/signin', function(req, res) {
  res.render('signin');
});

// ajax target for checking username
//app.post('/signup/check/username', function(req, res, frsON) {
app.post('/signup/check/username', function(req, res) {
  var username = req.body.username;
  var usernameTaken = false;

  // check if username contains non-url-safe characters
  if (username !== encodeURIComponent(username)) {
    res.json(403, {
      invalidChars: true
    });
    return;
  }
  
  // check if username is already taken - query your db here
  db.get(adder(username), function(err, value) {
	if (err) {
	  if (err.notFound) {
		//console.log(username + ' not found');
  		// looks like everything is fine
		res.send(200);
		return false;
		}
	  return console.log(err)
	  };
	usernameTaken = true;
	//console.log('username found: ' + value);
	res.json(403, { isTaken: true });
	})

});

// target for form submit
app.post('/signup', function(req, response) {

  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var verification = req.body.verification;

  var error = null;
  // regexp from https://github.com/angular/angular.js/blob/master/src/ng/directive/input.js#L4
  var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;

  // check for valid inputs
  if (!username || !email || !password || !verification) {
    error = 'All fields are required';
  } else if (username !== encodeURIComponent(username)) {
    error = 'Username may not contain any non-url-safe characters';
  } else if (!email.match(EMAIL_REGEXP)) {
    error = 'Email is invalid';
  } else if (password !== verification) {
    error = 'Passwords don\'t match';
  }
  
  if (error) {
    response.status(403);
    response.render('signup', {
      error: error
    });
    return
  }

  // check if username is already taken
  for (var i = 0; i < entries.length; i++) {
	var splitted = entries[i].key.split(":",1);
	if (splitted == username) {
			usernameTaken = true;
			break;
		};
  	};

  // create salt and hash password
  pass.hash(password, function(err, salt, hash){
    if (err) console.log(err);
    
    // yeah we have a new user
    var user = {
      username: username,
      email: email,
      salt: salt,
      hash: hash,
      createdAt: Date.now()
    };
    
    // for fully featured example check duplicate email, send verification link and save user to db
    
    response.redirect('/settings');


    //key-value pairs - need to have delimiters for usernames & such
    //lets do: can do things like justin!last_login or justin:last_login
    //for security - non printable characters are better - eg: \x00 (null) through \xff (ÿ)

    var createUser = [
	{ type: 'put', key: user.username + ':username', value: user.username },
	{ type: 'put', key: user.username + ':email', value: user.email },
	{ type: 'put', key: user.username + ':pwdsalt', value: user.salt },
	{ type: 'put', key: user.username + ':pwdhash', value: user.hash },
	{ type: 'put', key: user.username + ':createdAt', value: user.createdAt }
	]
     
    /* ****************
       ** Alternate input - key, value:{ key: value, key: value, key: value }}
       ****************
    db.put(user.username, {
		pwdsalt: user.salt,
		pwdhash: user.hash,
		createdAt: user.createdAt,
		email: user.email
		} 
	, function(err){
     */ 

    db.batch(createUser, function(err){
	if(err) throw err;
	});

  });
    
});

var psauth = passport.authenticate('local-login', {
		successRedirect : '/settings', // redirect to the secure profile section
		failureRedirect : '/signin' // redirect back to the signup page if there is an error
	})

app.post('/signin', psauth, function(req, response) {


   var username = req.body.username;
   var password = req.body.password;

   var error = null;
  
   if (!username || !password) {
	error = 'All fields are required';
	};

   if (error) {
	response.status(403);
	response.render('signin', {
		error: error
		});
	return
	}


});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

