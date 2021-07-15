const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const mysql = require('mysql')
const session = require('express-session')
const bodyParser = require('body-parser')
const {messageFormat} = require('./globals')

const app = express();
const server = http.createServer(app);

const io = socketio(server);
//DEFAULT VALUES CHANGE
const mysqlConn = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});

const port = process.env.PORT || 3000;
const auto = 'Auto';

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

//BASIC ROUTING
app.get('/', (request, response) => {
	response.sendFile(__dirname + '/public/index.html');
});
app.post('/auth', (request, response) => {
    //TEST DATA
    const email = 'test@email.test';
    const password = '123456';
    request.session.loggedin = true;
    request.session.user = {
        name: "Kotsarikos"
    };
    response.redirect('/home');
    //TEST DATA END
    
    // const email = request.body.email;
    // const email = request.body.email;
    
    // if(email && password) {
    //     mysqlConn.query('SELECT * FROM accounts WHERE email = ? AND password = ?',
    //         [email, password], 
    //         (error, results, fields) => {
    //             if (results.length > 0) {
    //                 request.session.loggedin = true;
    //                 request.session.user = results.user;
    //                 response.redirect('/home');
    //             } else {
    //                 response.send('Incorrect Credentials');
    //             }			
    //             response.end();
    //         });
    // } else {
    //     response.send('Please enter Email and Password!');
	// 	response.end();
    // }
})
app.get('/home', (request, response) => {
    
	if (request.session.loggedin) {
		//response.send('Welcome back, ' + request.session.user.name + '!');
        response.sendFile(path.join(__dirname, 'public/home.html'));
	} else {
		//response.send('Please login to view this page!');
        response.sendFile(path.join(__dirname, 'public/index.html'));
	}
	// response.end();
});
//Socket Listeners
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
