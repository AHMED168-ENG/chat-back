const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const  bootstarp  = require('./src/socket/index');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const PORT = 5000;

app.get('/', (req, res) => {
  res.send("WebSocket server is running.");
});

bootstarp(io);


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
