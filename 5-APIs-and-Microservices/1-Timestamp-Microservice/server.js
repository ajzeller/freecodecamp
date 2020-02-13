// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

const endpoint = '/api/timestamp/:date_string?'

function handler(req, res){
  const value = req.params.date_string
  let date
  
  // if string is empty, create new date from current
  if(!value){
    date = new Date()  
  } else {
    // if date string is integer, evaluate it as an integer
    if(!isNaN(value)){
      date = new Date(parseInt(value))
    } else {
      date = new Date(value)
    }
  }
  
  if(date.toString() === 'Invalid Date'){
    res.json({ 
      "error": "Invalid Date"
    })
  } else {
    res.json({
      "unix": date.getTime(),
      "utc": date.toUTCString()
    })
  }
}

app.get(endpoint, handler)



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});