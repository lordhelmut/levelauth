# Level Auth
Simple auth program for LevelDB.  Requires Node, express, jade, and pwd library.  Front end app is AngularJS.

### Config
`git clone https://github.com/lordhelmut/levelauth.git`

`npm install`

Start the app
`node app.js` or `npm start`

The level database will be stored in the **lvlauth.db** folder in the same directory by default.  You can change this by setting the environment variable for the DBPATH when starting node.  
`DBPATH='/path/to/your/preferred/folder' npm start` 

Open your browser to http://localhost:30000
