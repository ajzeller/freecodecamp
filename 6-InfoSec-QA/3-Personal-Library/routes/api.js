/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
// const MONGODB_CONNECTION_STRING = process.env.DB;
const runner            = require('../test-runner');

//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app, db) {
  
  const collectionName = db.collection('booksCollection')
  
    //Index page (static HTML)
  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });

  app.route('/api/books')
    .get(function (req, res){
      collectionName.find().toArray( (err, result) => {
        if(err) {
          return res.json(err)
        }
        
        const booksArr = result.map(book => ({
          title: book.title,
          _id: book._id,
          commentcount: book.comments.length
        }))
        
        res.json(booksArr)
      })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      const title = req.body.title;
    
      // check if valid title was entered
      if(typeof title == 'undefined' || title.length == 0){
        return res.json('please enter a valid book title')
      }
    
      collectionName.insertOne({title, comments: []}, (err, result) => {
        // console.log(result)
        res.json(result.ops[0])
      })
        //response will contain new book object including atleast _id and title
      })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      collectionName.deleteOne({ }, (err, result) => {
          if(err) {
            res.json(err)
          }

          if(result.result.n){
            res.json('complete delete successful')
          } else {
            res.json('unable to delete')
          }
        })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      
      // check if an ID was entered
      if(typeof bookid == 'undefined'){
        return res.json('no id entered')
      }
    
      // check if ID is valid and update it
      if(ObjectId.isValid(bookid)){
        bookid = ObjectId(bookid)
      } else{
        res.json('no book exists')
      }
    
      collectionName.findOne({_id: bookid}, (err, result) => {
            if(err){
              return res.json(err)
            }
            return res.json(result)
          })
    
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      const comment = req.body.comment;
      
      // check if an ID was entered
      if(typeof bookid == 'undefined'){
        return res.json('no id entered')
      }
    
      // check if ID is valid and update it
      if(ObjectId.isValid(bookid)){
        bookid = ObjectId(bookid)
      } else{
        res.json('no book exists')
      }
      
      // check if comment is valid
      if(typeof comment == 'undefined' || comment.length == 0){
        res.json('please enter a valid comment')
      }
    
      collectionName.updateOne({_id: bookid}, {$push: {comments: comment}}, (err, result) => {
        if(err){
          return res.json(`unable to update db: ${err}`)
        }
        
        // check that db item was properly updated
        if(result.result.n){
          collectionName.findOne({_id: bookid}, (error, data) => {
            if(error){
              return res.json(error)
            }
            return res.json(data)
          })
        }
      })
    
      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
    
      // check if an ID was entered
      if(typeof bookid == 'undefined'){
        return res.json('no id entered')
      }
    
      // check if ID is valid and update it
      if(ObjectId.isValid(bookid)){
        bookid = ObjectId(bookid)
      } else{
        res.json('no book exists')
      }
    
      collectionName.deleteOne({_id: bookid}, (err, result) => {
        if(err) {
          res.json(err)
        }
        
        if(result.result.n){
          res.json('delete successful')
        } else {
          res.json('unable to delete')
        }
      })
      //if successful response will be 'delete successful'
    });
  
    //404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

  //Start our server and tests!
  app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port " + process.env.PORT);
    if(process.env.NODE_ENV==='test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch(e) {
          var error = e;
            console.log('Tests are not valid:');
            console.log(error);
        }
      }, 1500);
    }
  });
  
};
