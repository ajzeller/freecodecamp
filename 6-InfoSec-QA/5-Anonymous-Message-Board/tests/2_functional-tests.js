/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  const board = 'testBoard'
  let threadId = ''
  let threadId2 = ''

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    const url = `/api/threads/${board}`
    const testText = 'test thread'
    const testPassword = 'test_password'
    
    suite('POST', function() {
      test('POST new thread', function(done){
        chai.request(server)
          .post(url)
          .send({
            text: testText,
            delete_password: testPassword
          })
          .end(function(err,res){
            assert.equal(res.status, 200)
            assert.equal(res.redirects[0].split('/')[4], board)
          
            done()
        })
        
      })
    });
    
    suite('GET', function() {
      test('GET array of most recent threads', function(done){
        chai.request(server)
          .get(url)
          .end(function(err,res){
            // console.log(res.body)
            assert.equal(res.status, 200)
            assert.property(res.body[0], '_id')
            assert.property(res.body[0], 'text')
            assert.property(res.body[0], 'created_on')
            assert.property(res.body[0], 'bumped_on')
            assert.property(res.body[0], 'replies')
          
            threadId = res.body[0]._id
            threadId2 = res.body[1]._id
          
            assert.isString(res.body[0]._id)
            assert.equal(res.body[0].text, testText)
            assert.isArray(res.body[0].replies)
          
            done()
        })
        
      })
    });
    
    suite('DELETE', function() {
      test('DELETE thread', function(done){
        chai.request(server)
          .delete(url)
          .send({
            thread_id: threadId,
            delete_password: testPassword
          })
          .end(function(err,res){
            assert.equal(res.status, 200)
            assert.equal(res.body, 'success')
          
            done()
        })
        
      })
    });
    
    suite('PUT', function() {
      test('PUT report thread', function(done){
        chai.request(server)
          .put(url)
          .send({
            thread_id: threadId2
          })
          .end(function(err,res){
              assert.equal(res.status, 200)
              // console.log(res.body)
              assert.equal(res.body, 'success')

              done()
          })
        
      })
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    const url = `/api/replies/${board}`
    const testText = 'test reply text'
    const testPassword = 'test_reply_password'
    let replyId = ''
    
    suite('POST', function() {
      test('POST new reply to thread', function(done){
        chai.request(server)
          .post(url)
          .send({
            text: testText,
            delete_password: testPassword,
            thread_id: threadId2
          })
          .end(function(err,res){
                // console.log(res.body)
                assert.equal(res.status, 200)
                assert.equal(res.redirects[0].split('/')[4], board)
                assert.equal(res.redirects[0].split('/')[5], threadId2)

                done()
            })
        
      })
    });
    
    suite('GET', function() {
      test('GET thread with all replies', function(done){
        chai.request(server)
          .get(url)
          .query({
            thread_id: threadId2
          })
          .end(function(err,res){
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            assert.property(res.body, 'text')
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'bumped_on')
            assert.property(res.body, 'replies')
            
            replyId = res.body.replies[0]._id
          
            done()
          })
        
        
      })
    });
    
    suite('PUT', function() {
      test('PUT report a reply', function(done){
        chai.request(server)
          .put(url)
          .send({
            thread_id: threadId2,
            reply_id: replyId
          })
        .end(function(err,res){
          assert.equal(res.status, 200)
          assert.equal(res.body, 'success')
          
          done()
        })
        
      })
    });
    
    suite('DELETE', function() {
      test('DELETE change reply text to [deleted]', function(done){
        chai.request(server)
          .delete(url)
          .send({
            thread_id: threadId2,
            reply_id: replyId,
            delete_password: testPassword
          })
        .end(function(err,res){
          assert.equal(res.status, 200)
          assert.equal(res.body, 'success')
          
          done()
        })
        
      })
    });
    
  });

});
  