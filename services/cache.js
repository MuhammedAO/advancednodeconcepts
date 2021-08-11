const mongoose = require('mongoose')
const redis = require("redis")
const util = require('util')

const redisUrl = "redis://127.0.0.1:16379"
const client = redis.createClient(redisUrl)

client.get = util.promisify(client.get)


const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.exec = async function(){
  console.log('about to run a query')

 const key = JSON.stringify(Object.assign({}, this.getQuery(), {
   collection: this.mongooseCollection.name
 }))
 
 //check for a value of 'key' in redis
 const cachedValue = await client.get(key)

 //if found, return
 if(cachedValue){
   console.log(cachedValue)

   return JSON.parse(cachedValue)
 }
 //if !found, issue the query and store the result in redis

  const result = await exec.apply(this, arguments)
  client.set(key, JSON.stringify(result))

  return result
}