'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');
const helmet = require('helmet')
const mongo = require('mongodb').MongoClient

var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use parent helmet() middleware
app.use(helmet())
app.use(helmet.noCache())
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))


//For FCC testing purposes
fccTestingRoutes(app);

const dbName = 'fccProject3Db'

mongo.connect(process.env.DATABASE, (err,client) => {
  if(err){
    console.log(`Database error ${err}`)
  } else {
    console.log('successful database connection')
    
    const db = client.db(dbName)
    
    //Routing for API 
    apiRoutes(app, db); 
    
  }
})

 
    


module.exports = app; //for unit/functional testing
