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
const bot = 'Bot';

//Make session obj to middlware func and pass to both app and io
const sessionMiddleware = session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
});

io.use( (socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

app.use(sessionMiddleware);

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

    const sessionIo = JSON.parse(JSON.stringify(socket.request.session));
    const user = sessionIo.user;

    socket.broadcast.emit('message', messageFormat(bot, `${user.username} has Connected`));

    //Listen to disconnect from client
    socket.on('disconnect', () => {
        console.log("Disconected user");
        io.emit('message', messageFormat(user, `${user.username} has Disconnected`));
    });

    //Listen to message from client
    socket.on('message', msg => {
        io.emit('message', messageFormat(user, msg));
    })
});

server.listen(port, () => console.log(`listening on http://localhost:${port}`));
