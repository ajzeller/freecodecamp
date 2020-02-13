module.exports = function(stock, db, isLiked, ip) {
  const stocksCollection = db.collection('stocks')
  
  const updateOptions = isLiked ? {$addToSet: {ips: ip}, $set: {lastModified: new Date()}} : {$set: {lastModified: new Date()}}
  
  stocksCollection.updateOne({ticker: stock.toLowerCase()}, updateOptions, {upsert: true})
                .then(result => {
                // console.log(result)

                // and then retrieve the doc to count the number of IP addresses which corresponds to number of likes
                stocksCollection.findOne({ticker: stock.toLowerCase()})
                  .then(data => {
                    console.log(data)

                    let numLikes
                    if(typeof data.ips == 'undefined'){
                      numLikes = 0
                    } else {
                      numLikes = data.ips.length
                    }

                    const stockObj = {
                      'stockData': {
                        stock: stock.toUpperCase(),
                        price,
                        likes: numLikes
                      }
                    }

                    console.log(stockObj)

                    return (stockObj) 
                  
                }).catch(error => (`db find error: ${error}`) )
                
              }).catch(err => (`error updating db: ${err}`) )
}