const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const {messageFormat} = require('./globals')

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

const auto = 'Auto';

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {

    socket.broadcast.emit('message', messageFormat(auto, 'User --- Connected'));
    //Listen to disconnect from client
    socket.on('disconnect', () => {
        io.emit('message', messageFormat(auto, 'User --- disconnected'));
    });

    //Listen to message from client
    socket.on('message', msg => {
        io.emit('message', messageFormat('current user', msg));
    })
});

server.listen(port, () => console.log(`listening on http://localhost:${port}`));
