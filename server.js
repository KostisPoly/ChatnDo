const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {

    socket.broadcast.emit('message', 'User --- Connected');

    socket.on('disconnect', () => {
        io.emit('message', 'User --- disconnected');
    });
});

server.listen(port, () => console.log(`listening on http://localhost:${port}`));
