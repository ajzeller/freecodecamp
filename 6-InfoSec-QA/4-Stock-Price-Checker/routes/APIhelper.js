'use strict';

const fetch = require('node-fetch')
const token = process.env.IEXCLOUD_SECRET

module.exports = function(stock) {
      if(typeof stock === 'object'){
        // handle fetch for two stocks
        const promises = [
          fetch(`https://cloud.iexapis.com/stable/stock/${stock[0]}/quote?token=${token}`)
            .then(result => result.json()),
          
          fetch(`https://cloud.iexapis.com/stable/stock/${stock[1]}/quote?token=${token}`)
            .then(result => result.json())
        ]
        
        return Promise.all(promises)
      } else {
        // handle fetch for one stock
        return fetch(`https://cloud.iexapis.com/stable/stock/${stock}/quote?token=${token}`)
                .then(result => result.json())
      }
  
}