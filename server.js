const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const mysql = require('mysql')
const session = require('express-session')
const sharedSession = require('express-socket.io-session')
const bodyParser = require('body-parser')
const moment = require('moment');
const {messageFormat, intervalCheck} = require('./globals');

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
const bot = 'Bot';

//Make session obj to middlware func and pass to both app and io
const sessionMiddleware = session({
	secret: 'secret',
    resave: true,
    saveUninitialized: true
});

app.use(sessionMiddleware);

io.use(sharedSession(sessionMiddleware));

io.on('connection', socket => {
    console.log("on Connect Io");
    //console.log(socket.handshake.session);
    // const sessionIo = JSON.parse(JSON.stringify(socket.request.session));
    //console.log(socket.handshake.session);
    const user = socket.handshake.session.user;
    socket.handshake.session.save();
    if(user) {
        io.on("login", user => {
            socket.handshake.session.user = user;
            socket.handshake.session.save();
        });
        //const user = socket.handshake.session.user;
        socket.on('disconnect', () => {
            console.log("Disconected user");
            console.log(socket.handshake.session);
            if (!user) {
                console.log("NO USER IN SESSION");
            }
            io.emit('message', messageFormat(user, `${user.username} has Disconnected`));
        });
    
        //Listen to message from client
        socket.on('message', msg => {
            io.emit('message', messageFormat(user, msg));
        })
    }else{
        console.log("CONNECTION USER NOT PRESENT");
    }
    
});

//Test IO to REQUEST APP
app.use((req, res, next) => {
    req.io = io;
    return next();
});

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

//BASIC ROUTING
app.get('/', (request, response) => {
	response.sendFile(__dirname + '/public/index.html');
});

app.post('/auth', (request, response) => {
    const email = request.body.email;
    const password = request.body.password;
    
    if(email && password) {
        mysqlConn.query('SELECT * FROM accounts WHERE email = ? AND password = ?',
            [email, password], 
            (error, results, fields) => {
                if (results.length > 0) {
                    const user = JSON.parse(JSON.stringify(results[0]));
                    request.session.loggedin = true;
                    request.session.user = user;
                    response.redirect('/home');
                    mysqlConn.query('UPDATE accounts SET online = ? WHERE id = ?',
                        [1, user.id],
                        (error, results, fields) => {
                            console.log(results);
                        })
                } else {
                    response.send('Incorrect Credentials');
                }			
                response.end();
            });
    } else {
        response.send('Please enter Email and Password!');
		response.end();
    }
})

app.get('/home', (request, response) => {
    //console.log(request.session);
	if (request.session.loggedin) {
        response.sendFile(path.join(__dirname, 'public/home.html'));
	} else {
        response.redirect('/');
	}
});

app.get('/chat', (request, response) => {
    console.log("on Chat route");
    console.log(request.session);
	if (request.session.loggedin) {
        response.sendFile(path.join(__dirname, 'public/chat.html'));
	} else {
        response.redirect('/');
	}
});

app.get('/update-user', (request, response) => {
    if(request.session.user) {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        mysqlConn.query('UPDATE accounts SET online = ?, timestamp = ? WHERE id = ?',
        [1, timestamp, request.session.user.id],
        (error, results, fields) => {
            console.log(results);
        })
    }
    
});

intervalCheck();

server.listen(port, () => console.log(`listening on http://localhost:${port}`));
