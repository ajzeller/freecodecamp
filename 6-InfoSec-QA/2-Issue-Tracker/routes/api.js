/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const runner = require('../test-runner');
const expect = require('chai').expect;
// var MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

// const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app, db) {
  
    //Index page (static HTML)
  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });
  
    //Sample front-end
  app.route('/:project/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/issue.html');
    });
  

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const project = req.params.project;
      
      
      
      const collectionName = 'issueTracker_' + project
      
      // let query = req.query
      let query = req.query
      
      
      // convert open: true/false string to boolean
      if(query.open == 'true'){
        query.open = true
      } else if(query.open == 'false'){
        query.open = false
      }
    
      // return matched issues from collection in an array
      db.collection(collectionName).find(query).toArray( (err, result) => {
        if(err){return console.log(`Error getting issues from DB $[err}`)}
        // console.log(result)
        return res.json(result)
      })
      
    })
    
    .post(function (req, res){
      const project = req.params.project;
    
      const collectionName = 'issueTracker_' + project
      
      let issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }
      
      // check that the required fields have been completed
      const missingIssueTitle = typeof req.body.issue_title == 'undefined'
      const missingIssueText = typeof req.body.issue_text == 'undefined'
      const missingCreatedBy = typeof req.body.created_by == 'undefined'
      
      if(missingIssueTitle || missingIssueText || missingCreatedBy){
        return res.json('Missing one or more required fields')
      }
      
      db.collection(collectionName).insertOne(issue, (err, result) => {
        if(err){return console.log(`Error posting new issue: ${err}`)}
        // console.log(result.ops[0])
        
        return(res.json(result.ops[0]))
      })
    
      // check if project name exists in ProjectsDB
        // if project name exists, save new issue object with association to project
        // if project name does not exist, add projects to ProjectsDB and then save new issue object with association to project
    })
    
    .put(function (req, res){
      const project = req.params.project;
      let collectionName = 'issueTracker_' + project
      let issue = req.body
      
      console.log(typeof issue.otherthing)
      console.log(issue._id)
    
      // check if request contains ID
      if(typeof issue._id == 'undefined' || issue._id.length == 0){
        return res.json('missing issue id') 
      }
    
      // check if id is valid and set with object ID
      if(ObjectId.isValid(issue._id)){
        issue._id = ObjectId(issue._id)
      } else {
        return res.json('invalid ID')
      }
    
      // check if request includes fields to update
      if(Object.keys(issue).length == 1) {
        return res.json('no updated field sent')
      }
    
      // overwrite 'open' key from string to bool
      if(issue.open == 'false') {
        issue.open = false
      } 
    
      // remove fields that are not included to prevent overwrite
      for (let elem in issue){
        if(issue[elem].length == 0){
          delete issue[elem]
        }
      }
    
      // set new updated time
      issue.updated_on = new Date()
    
      
      
      db.collection(collectionName)
        .updateOne({_id: issue._id}, 
                   {$set: issue}, 
                   (err, result) => {
        if(err) {return res.json(`Error updating: ${err}`)}

        if(result.result.n){
          return res.json('successfully updated')
        } else {
          return res.json(`Error updating: ${err}`)
        }
      })
      
    })
    
    .delete(function (req, res){
      // console.log('route: DEL')
    
      const project = req.params.project;
      const collectionName = 'issueTracker_' + project
      let idToDelete = req.body._id
      
      // console.log(idToDelete)
    
      if(typeof idToDelete == 'undefined'){
        return res.json('_id error')
      }
    
      // check if id is valid and set with object ID
      if(ObjectId.isValid(idToDelete)){
        idToDelete = ObjectId(idToDelete)
      } else {
        return res.json('_id error')
      }
    
      db.collection(collectionName).deleteOne({_id: idToDelete}, (err, result) => {
        if(err){ 
          return res.json(`could not delete ${idToDelete}`)
        }
        
        if(result.result.n){
          res.json(`deleted ${idToDelete}`)
        } else {
          res.json(`could not delete ${idToDelete}`)
        }
        
      })
    
      
    
    });
  
  app.route('/api/projects')
    .get( function(req,res){
    let collectionsArr
    
      db.listCollections().toArray( (err, data) => {
        if(err) {return res.json(`error: ${err}`)}
        // collectionsArr = data.map(item => item.name)
        collectionsArr = data.map(item => item.name.match(/(?<=_).*/).join(''))
        return res.json(collectionsArr)
      })
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
      }, 3500);
    }
  });
    
};
