'use strict';

const expect = require('chai').expect;
const runner            = require('../test-runner');
const fetch = require('node-fetch')
const moment = require('moment')
const APIhelper = require('./APIhelper')

module.exports = function (app, db) {
  
  const stocksCollection = db.collection('stocks')
  
  //Index page (static HTML)
  app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });

  app.route('/api/stock-prices')
  
    .get(function (req, res){
    
      const ticker = req.query.stock
      let isLiked = req.query.like
      let ip = req.header('x-forwarded-for') || req.connection.remoteAddress
      ip = ip.split(',')[0]
    
      if(typeof ticker == 'undefined' || ticker.length == 0){
        return res.json('Please enter a valid ticker symbol')
      }
    
      // if(typeof isLiked == 'undefined'){
      //   isLiked = false
      // }
    
      APIhelper(ticker)
        .then(data => {
        // console.log(data)
        
        // handle two stocks
          const updateOptions = isLiked ? {$addToSet: {ips: ip}, $set: {lastModified: new Date()} } : 
            {$set: {lastModified: new Date()}, $setOnInsert: {ips: []}}
        
          if(Array.isArray(data)){
            
            const DBupdate = [
              stocksCollection.updateOne({ticker: data[0].symbol}, updateOptions, {upsert: true}),
              stocksCollection.updateOne({ticker: data[1].symbol}, updateOptions, {upsert: true})
            ]
            
            Promise.all(DBupdate).then(response => {
              stocksCollection.find({ticker: { $in: [ data[0].symbol, data[1].symbol ]}}).toArray()
              // .then( stocks => console.log(stocks))
                .then( stocks => {
                const stockA = data[0].symbol == stocks[0].ticker ? 0 : 1
                const stockB = data[0].symbol == stocks[0].ticker ? 1 : 0
                
                // console.log(`stockA:${stockA} stockB:${stockB}`)
                
                const r = {
                stockData: [{
                  stock: stocks[stockA].ticker,
                  price: data[0].latestPrice,
                  rel_likes: stocks[stockA].ips.length - stocks[stockB].ips.length
                },
                {
                  stock: stocks[stockB].ticker,
                  price: data[1].latestPrice,
                  rel_likes: stocks[stockB].ips.length - stocks[stockA].ips.length
                }
               ]
              }
                // console.log(r)
                return res.json(r)
              })
            })
            
            // handle one stock
          } else{
            stocksCollection.updateOne({ticker: data.symbol}, updateOptions, {upsert: true})
              .then(result => {
                stocksCollection.findOne({ticker: data.symbol}).then(stock => {
                  
                  console.log(stock)
                  const r = {
                    stockData: {
                      stock: stock.ticker,
                      price: data.latestPrice,
                      likes: stock.ips.length
                    }
                  }
                  
                  // console.log(r)
                  return res.json(r)
                })
              
            })
          }
        })
        .catch(error => res.json('Please enter a valid ticker symbol'))
    
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
      }, 3500);
    }
  });
    
};
