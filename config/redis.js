const redis = require('redis');
require("dotenv").config();

const host = process.env.REDIS_HOST
const port =process.env.REDIS_PORT
const pass = process.env.REDIS_PASS

let client
if(pass){
    client = redis.createClient({
        url:`redis://:${pass}@${host}:${port}`,
    });
}else{
    client = redis.createClient({
        url:`redis://${host}:${port}`,
    });
}



module.exports = client;
