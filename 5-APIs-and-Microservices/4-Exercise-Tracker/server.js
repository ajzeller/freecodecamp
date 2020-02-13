const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongo = require('mongodb')
const mongoose = require('mongoose')
const shortid = require('shortid')
const moment = require('moment')

const User = require('./models/userModel')
const Exercise = require('./models/exerciseModel')

let db = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if(err) console.log(err)
  console.log('connection to DB successful')
}); 

app.use(cors())

// setup body parser 

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
// app.use('/public', express.static(process.cwd() + '/public/'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});




// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// setup mongoose model

app.post('/api/exercise/new-user', (req, res, next) => {
  const username = req.body.username
  
  User.find({username: username}, (err, data) => {
    if(data.length > 0){
      res.send('username already taken')
    }
    
    let newUser = new User({
      _id: shortid.generate(),
      username: username
    })
    
    newUser.save((err,data) => {
      if(err) console.log(err)
      res.json({data})
    })
  })
})

function newDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}


app.post('/api/exercise/add', (req, res, next) => {
  // const exerciseDate = req.body.date ? req.body.date : newDate()
  
  // check if userId exists
  
  User.findOne({_id: req.body.userId}).then(result => {
    // if user exists
    if(result){
      let exerciseDate
      
      // check if exercise date was entered
      if(req.body.date){
        exerciseDate = req.body.date
      } else {
        exerciseDate = new Date()
      }
      
      // create new exercise
      let newExercise = new Exercise({
        _id: shortid.generate(),
        userId: req.body.userId,
        description: req.body.description,
        duration: req.body.duration,
        date: exerciseDate
      })
      
      // save new exercise
      newExercise.save((err, exercise) => {
        if (err) {return next(err)}
        
        // generate new exercise to return in response
        const exerciseDateFormatted = moment(exercise.date).format('YYYY MM DD')
        
        const exerciseToReturn = {
          username: result.username,
          description: exercise.description,
          duration: exercise.duration,
          _id: exercise._id,
          date: exerciseDateFormatted
        }
        
        // send new exercise object in response
        res.json(exerciseToReturn)
      })
      
    } else {
      res.send('unknown userId')
    }
  })
})

app.get('/api/exercise/log', (req, res, next) => {
  const query = {}
  
  if(req.query.userId) {
    query.userId = req.query.userId
    
    // handle to and/or from queries
    if(req.query.from || req.query.to){
      query.date = {}  
    }
    
    if(req.query.from){
      query.date.$gte = req.query.from
    }
    
    if(req.query.to){
      query.date.$lte = req.query.to
    }
    
    User.findOne({_id: query.userId}).then(user => {
      let exerciseQuery
      
      // handle limit value in query, else create query without limit
      if(req.query.limit){
        const limitValue = Number(req.query.limit)
        
        exerciseQuery = Exercise.find(query).limit(limitValue)
      } else {
        exerciseQuery = Exercise.find(query)
      }
      
      exerciseQuery.exec((err, exercises) => {
        if(err){
          return res.send(err)
        }
        
        const responseObj = {
          _id: user._id,
          username: user.username,
          count: exercises.length,
        }
        
        responseObj.log = exercises.map(exercise => {
          const exerciseDateFormatted = moment(exercise.date).format('YYYY MM DD')
          
          const exerciseObj = {
            description: exercise.description,
            duration: exercise.duration,
            date: exerciseDateFormatted
          }
          
          return exerciseObj
        })
        
        return res.json(responseObj)
        
      })
    })
    
  } else {
    res.send('please enter a user ID')
  }
})

// Not found middleware, MUST PLACE BELOW OTHER ROUTES
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
