const express = require("express");
const server = express();
const path = require("path");

server.use(express.json())
server.use(express.urlencoded({extended: true}))

server.use('/api', require('./routes/api').route)
server.use("/", express.static(path.join(__dirname, "./public")));

server.listen(1234)
{
  console.log(`Server is listening on port 1234`);
};