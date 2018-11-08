/**
 * 1. A user first register an account
 * 2. The user then add targets
 * 3. The user go to the target, and run the device.
 */

const express = require('express');
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


const serverIP = require('./config').serverIP;
const serverPort = require('./config').serverPort;
const mongodb_url = require('./config').mongodb_url;
const url_prefix = require('./config').url_prefix;


// user
const signupRoute = require('./routes/user_routes/signup_route');
const loginRoute = require('./routes/user_routes/login_route');
const logoutRoute = require('./routes/user_routes/logout_route');
// target
const registerTargetRoute = require('./routes/target_routes/register_route');
const queryTargetsRoute = require('./routes/target_routes/query_route');
const reportTargetRoute = require('./routes/target_routes/report_route');
// cors
const cors = require('./routes/cors');

///////// Express middleware //////////
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const session_key = require('./config').session_key;
const session_id = require('./config').session_id;
const passport = require('passport');
////////// Websocket (socket.io) middleware ///////
const sharedsession = require("express-socket.io-session");


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '50mb',
    extended: true
}));
// user_app.use(cookieParser(cookie_key));
const session_config = session({
    name: session_id,
    secret: session_key,
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
});
app.use(session_config);
app.use(passport.initialize());
app.use(passport.session());
io.use(sharedsession(session_config));

////////// Passport configuration ////////////////////////
const userDB = require('./db_models/user_db');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(userDB.authenticate()));
passport.serializeUser(userDB.serializeUser());
passport.deserializeUser(userDB.deserializeUser());


///////// Database configurations //////////
const mongoose = require('mongoose');
const bluebird = require('bluebird');

mongoose.Promise = bluebird;
mongoose.set('useCreateIndex', true)
mongoose.set('useNewUrlParser', true);
//mongoose.set('debug', true);
const connect = mongoose.connect(mongodb_url, {
});
connect.then((db)=>{
        console.log("[mongodb] connected correctly to server");
    }, (err)=>{
        console.log("[mongodb] connection failed")
        console.log(err);
});

/////////// Authentication //////////////////

function session_authentication(req, res, next){
    // this session is loaded from the file system with a key "file name" as the cookie
    // but using cookie is hidden from the developer.
    if(!req.user){
        res.statusCode = 403;
        res.json({
            success: false,
            reasons:["Please login or signup first"],
            value: null
        });
    }else{
        next();
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////Route setup         /////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

app.use(url_prefix + '/user/signup', signupRoute);
app.use(url_prefix + '/user/login', loginRoute);
app.use(url_prefix + '/target/report', reportTargetRoute);
app.use(cors.cors, session_authentication);
app.use(url_prefix + '/user/logout', logoutRoute);
app.use(url_prefix + '/target/register', registerTargetRoute);
app.use(url_prefix + '/target/query', queryTargetsRoute);


//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////  websocket setup   ////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
const addSocket = require('./ws_events/socket_manager').addSocket;
const deleteSocket = require('./ws_events/socket_manager').deleteSocket;
/** 
 * 1. one browser tag -> mutliple socket
 * 2. one user has multiple tag
*/

io.on('connection', (socket)=>{
    if(!socket.handshake.session.passport || !socket.handshake.session.passport.user){
        socket.emit('unauthorized');
        socket.disconnect('unauthorized');
        return;
    }
    let username = socket.handshake.session.passport.user;
    // routes, or topics
    socket.on('disconnect', ()=>{
        deleteSocket(username, socket);
    });
    socket.on('subscribe', (id, msg)=>{
        addSocket(username, socket);
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////


server.listen(serverPort, serverIP);
console.log(`LinuxMonitor server is running at http://${serverIP}:${serverPort}`);
