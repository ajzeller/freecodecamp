'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const expect      = require('chai').expect;
const cors        = require('cors');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');
const helmet = require('helmet')
const mongo = require('mongodb').MongoClient

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// use parent helmet() middleware
app.use(helmet())



//For FCC testing purposes
fccTestingRoutes(app);

const dbName = 'fccProject2Db'

// connect to db
mongo.connect(process.env.DATABASE, (err,client) => {
  if(err) {
    console.log(`Database error ${err}`)
  } else {
    console.log('successful database connection')
    
    const db = client.db(dbName)
    
    //Routing for API 
    apiRoutes(app, db);  
    
    
  }
})


    




module.exports = app; //for testing
