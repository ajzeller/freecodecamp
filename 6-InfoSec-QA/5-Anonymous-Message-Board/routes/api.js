/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const runner            = require('../test-runner');
const shortid = require('shortid')

module.exports = function (app, db) {
  
  //Index page (static HTML)
  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });
  
  //Sample front-end
  app.route('/b/:board/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/board.html');
    });
  
  app.route('/b/:board/:threadid')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/thread.html');
    });
  
  app.route('/api/threads/:board')
    .get(function(req, res){
      const board = req.params.board
      
      // find all threads in board
      db.collection(board).find().toArray()
        .then( data => {
          // sort threads by date and keep only 10 (max)
          const recentThreads = data
            .sort((a,b) => (b.bumped_on - a.bumped_on))
            .filter( (e,i) => (i < 10))
            .map(thread => {
              let replies = thread.replies
              const numReplies = replies.length
              
              // remove oldest replies from replies array until there are 3 left
              for(let i=0; i < numReplies-3; i++){
                replies.shift()
                // console.log(replies)
              }
              
              return {
                _id: thread._id,
                text: thread.text,
                created_on: thread.created_on,
                bumped_on: thread.bumped_on,
                replies
              }
            })
          
          return res.json(recentThreads)
        })
    })
    
    .post(function(req, res){
      const board = req.params.board
      const text = req.body.text
      const delete_password = req.body.delete_password
      
      db.collection(board).insertOne({
        _id: shortid.generate(), 
        text, 
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password,
        replies: []
      })
        .then( data => res.redirect(`/b/${board}/`) )
        .catch(err => res.json(`unable to add to db: ${err}`))
    
    })
  
    .put(function(req, res){
      const board = req.params.board
      const _id = req.body.thread_id
      
      db.collection(board).updateOne({_id}, {$set: {reported: true}})
        .then(data => res.json('success'))
        .catch(err => res.json(`unable to update thread: ${err}`))
    
    })
    
    .delete(function(req, res){
      const board = req.params.board
      const delete_password = req.body.delete_password
      const _id = req.body.thread_id
      
      db.collection(board).findOne({ _id })
        .then(data => {
        // check if provided password matches
          if(data.delete_password === delete_password){
            db.collection(board).deleteOne({ _id })
              .then(result => res.json('success'))
          } else{
            res.json('incorrect password')
          }
      })
        .catch(err => res.json(`Could not find thread to delete ${err}`))
    
    })
    
  app.route('/api/replies/:board')
    .get(function(req, res){
      const board = req.params.board
      const threadId = req.query.thread_id
      
      db.collection(board).findOne({_id: threadId})
        .then( data => {
          // console.log(data)
          const repliesArr = data.replies.map(reply => ({
            _id: reply._id,
            text: reply.text,
            created_on: reply.created_on
          }))
          return res.json({
            _id: data._id,
            text: data.text,
            created_on: data.created_on,
            bumped_on: data.bumped_on,
            replies: repliesArr
          })
      })
        .catch( err => res.json(`unable to get thread from db: ${err}`))
    })
    
    .post(function(req, res){
      const board = req.params.board
      const text = req.body.text
      const delete_password = req.body.delete_password
      const threadId = req.body.thread_id
      const replyId = shortid.generate()
            
      const reply = {
        _id: replyId,
        text,
        created_on: new Date(),
        delete_password,
        reported: false
      }
      
      db.collection(board).updateOne({_id: threadId}, {$push: {replies: reply }, $set: {bumped_on: new Date()}})
        .then( data => res.redirect(`/b/${board}/${threadId}`))
        .catch( err => res.json(`failed to update db: ${err}`))
      
    })
  
    .put(function(req, res){
      const board = req.params.board
      const _id = req.body.thread_id
      const reply_id = req.body.reply_id
      
      db.collection(board).updateOne(
        {_id},
        {$set: {'replies.$[elem].reported' : true}},
        {multi: false, arrayFilters: [ { 'elem._id': {$eq: reply_id} } ] }
      )
        .then(data => res.json('success'))
        .catch(err => res.json(`unable to update reply in db: ${err}`))
      
    })
    
    .delete(function(req, res){
      const board = req.params.board
      const _id = req.body.thread_id
      const reply_id = req.body.reply_id
      const delete_password = req.body.delete_password
      
      // find the thread in db to check if reply_id and delete_password match
      db.collection(board).findOne({_id})
        .then(data => {
        
          const matchedReply = data.replies.find(reply => (reply._id === reply_id && reply.delete_password === delete_password))
          
          if(matchedReply){
            // console.log(matchedReply)
            
            // update thread doc with [deleted] text for matching reply
            db.collection(board).updateOne(
              {_id}, 
              {$set: {'replies.$[elem].text' : '[deleted]'}}, 
              {multi: false, arrayFilters: [ { 'elem._id': {$eq: reply_id} } ] }
            )
              .then(result => {
                // console.log(result)
                return res.json('success')
              })
              .catch(err => res.json(`unable to update reply in db: ${err}`))
            
          } else{
            return res.json('incorrect password')
          }
      })
        .catch(err => res.json(`error finding thread in db: ${err}`))
    
    })
  
  app.route('/api/boards')
    .get(function(req,res){
      db.listCollections({}).toArray()
        .then(data => res.json(data))
        .catch(err => res.json(`failed to get all collections: ${err}`))
  })
  
  
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
