'use strict';

const express = require('express');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const dns = require('dns')
const bodyParser = require('body-parser')
const cors = require('cors');
const URL = require('url').Url;
const autoIncrement = require('mongoose-auto-increment')
const connection = mongoose.createConnection(process.env.MONGO_URI)

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
let db = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if(err) console.log(err)
  console.log('connection to DB successful')
}); 


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// setup Mongoose

const Schema = mongoose.Schema

const urlSchema = new Schema({
  originalUrl: String,
  shortUrl: String
})

const Url = mongoose.model('Url', urlSchema, 'testName')

const newUrl = (newUrl) => {
  const url = new Url({
    url: newUrl
  })
  
  url.save(function(err, data){
    if(err) return console.error(err)
  })
  
  return url._id
}

const endpoint = '/api/shorturl/new'

app.post(endpoint, (req, res, next) => {
  const originalUrl = req.body.url
  const urlObj = new URL(originalUrl)
  dns.lookup(urlObj.hostname, (err, address, family) => {
    if(err) {
      res.json({
        error: "invalid URL"
      })
    }
    else {
      const randomId = Math.round(Math.random()*10000).toString()
      
      let shortenedUrl = new Url({
        originalUrl: originalUrl,
        shortUrl: randomId
      })
      
      shortenedUrl.save((e, data) => {
        if(e){
          console.error(e)
        }
      })
      
      res.json({
        original_url: originalUrl,
        short_url: shortenedUrl.shortUrl
      })
    }
  })
})

app.get('/api/shorturl/:shortId', (req, res) => {
  Url.findOne({shortUrl: req.params.shortId}, (err, data) => {
    if(err) return console.error(err)
    console.log(data.originalUrl)
    res.redirect(data.originalUrl)
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});