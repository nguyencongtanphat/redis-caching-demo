const { default: axios } = require('axios');
const express = require('express');
const redis = require('redis');
const util = require('util');


const redisUrl = "redis://127.0.0.1:6379";
const client =  redis.createClient({
    url: redisUrl,
});

(async () => {
  await client.connect();
})();

client.on("connect", function () {
  console.log("redis connected");
  console.log(`connected ${client.connected}`);
});

const app = express();
app.use(express.json());

app.post("/",async (req, res) => {
    
    const {key, value} = req.body;
    const response = await client.set(key, value);
    res.json(response);
})

app.get("/posts/:id/", async(req, res) => {
  const {id} =req.params;
  console.log("1")
  const cachedPost = await client.get(`post-${id}`);
 console.log("2");
  if(cachedPost){
    console.log("3");
    return res.json(JSON.parse(cachedPost));
  }
  console.log("4");
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );
  console.log("5");
    client.SETEX(`post-${id}`, 5,JSON.stringify(response.data))
    
  res.json(response.data);
});

app.get("/",async(req, res)=>{
    
    const data =await  client.get(req.body.key);
    res.json(data);
})

app.listen(3000,()=>{
    console.log('listening on port 3000');
})