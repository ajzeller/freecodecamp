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
const sassMiddleware = require('node-sass-middleware')
const path = require('path')

const app = express();

 app.use(
     sassMiddleware({
         src: __dirname, //where the sass files are 
         // src: __dirname + '/sass', //where the sass files are 
         dest: __dirname, //where css should go
         debug: true // obvious
     })
 );

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.frameguard({action: 'deny'}))
app.use(helmet.dnsPrefetchControl())


//For FCC testing purposes
fccTestingRoutes(app);

const dbName = 'fccProject5'

mongo.connect(process.env.DATABASE, {useUnifiedTopology: true})
  .then( client => {
    console.log('successful database connection')
    
    const db = client.db(dbName)
    
    //Routing for API 
    apiRoutes(app, db);
    
  })
  .catch( err => console.log(`Database error: ${err}`)
  )

module.exports = app; //for testing
