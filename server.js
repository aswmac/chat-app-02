const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let chatHistory = { window1: '', window2: '' };
let claimers = { window1: null, window2: null };

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send initial chat history
  socket.emit('chatHistory', chatHistory);

  socket.on('claimWindow', ({ window }) => {
    if (!claimers[window]) {
      claimers[window] = socket.id;
      io.emit('windowClaimed', { window, userId: socket.id });
      console.log(`User ${socket.id} claimed ${window}`);
    }
  });

  socket.on('releaseWindow', ({ window }) => {
    if (claimers[window] === socket.id) {
      claimers[window] = null;
      io.emit('windowReleased', { window, userId: socket.id });
      console.log(`User ${socket.id} released ${window}`);
    }
  });

  socket.on('typing', ({ window, text }) => {
    if (claimers[window] === socket.id) {
      chatHistory[window] = text;
      io.emit('updateText', { window, text });
    }
  });

  socket.on('disconnect', () => {
    Object.keys(claimers).forEach((window) => {
      if (claimers[window] === socket.id) {
        claimers[window] = null;
        io.emit('windowReleased', { window, userId: socket.id });
        console.log(`User ${socket.id} disconnected and released ${window}`);
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
