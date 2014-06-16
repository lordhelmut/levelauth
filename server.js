var levelup  = require('levelup');
var db = levelup('/tmp/lvldbtmp.db');
var username = process.argv[2];

function splitter(data) {
	return data.split(":",1).toString();
	}

function adder(data) {
        return data.toString() + ':username';
        };

/*
db.put('name', 'JustinRocks', function(err) {
	db.batch([
		{ type:'put',key:'email',value:'justinrocks@entropytechnology.com'},
		{ type:'put',key:'active',value:'hellYeah'}
	], function (err) {
			db.createReadStream()
				.on('data',console.log)
				.on('close',function(){
					db.close()
				})
			})
		})
*/

/*
db.createReadStream()
	.on('data',console.log)
	.on('close',function(){
		db.close()
		})
*/

var entries=[]
//db.createReadStream({start:'justin', end:'justin\xff',values:false})
db.createReadStream({start:'', end:'',values:true})
	.on('data', function (entry) {entries.push(entry) })
	.on('close',function () {console.log(entries)})

/*
db.createValueStream()
	.on('data', function (data) {
		console.log('value=', data)
	})
*/

/*
db.createKeyStream()
	.on('data', function (data) {
		console.log('key=' +  data)
	})
*/

/*
var entries=[]
db.createKeyStream()
	.on('data',function (entry) { entries.push(entry)})
	.on('close',function() { console.log(entries)});
*/

/*
var keyStream = db.createKeyStream();
keyStream.on('data', function(stuff) {
	//console.log('key data is: ' + stuff)
	//var splitted = stuff.split(":",1);
	//if (splitted == 'asdf' ) {
	if (splitter(stuff) == 'asdf' ) {
		//console.log('Found splitted as: ' + splitted);
		console.log('Found splitted' );
		keyStream.destroy();
		}
	});
*/

/*
var readStream = db.createReadStream({});
readStream.on('data', function(stuff){
	console.log('data is: ' + stuff.value);
	var splitted = stuff.key.split(":",1);
	//console.log(splitted);
	//if (stuff.key == 'justin:pwdsalt'){
	if ( splitted == 'sdf'){
		console.log('Found splitted as: ' + splitted);
		readStream.destroy();
	}
});
*/
var usernameTaken = false;

function dbGet(err,value) {
	if (err) { 
		if (err.notFound) {
			console.log('not found')
			return;
			}
		return console.log('haha ' , err) //some other error
	}
		//usernameTaken = true;
		//console.log('success: ' + value);
		return value;
	}



//db.get(adder(username),dbGet);

/*
db.get(adder(username), function(err, value) {
	if (err) {
		if (err.notFound) {
			console.log('usernameTaken false? ' + usernameTaken );
			return
		}
		return console.log('haha ' ,err) //some other I/O error
	}
   usernameTaken = true;
   console.log('usernameTaken true? ' + usernameTaken)
 });
*/
