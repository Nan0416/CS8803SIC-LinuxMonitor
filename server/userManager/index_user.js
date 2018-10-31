/**
 * 1. A user first register an account
 * 2. The user then add targets
 * 3. The user go to the target, and run the device.
 */

const express = require('express');
const server = express();

const serverIP = require('./config').serverIP;
const serverPort = require('./config').serverPort;
const mongodb_url = require('./config').mongodb_url;
const url_prefix = require('./config').url_prefix;


// user
const signupRoute = require('./routes/user_routes/signup_route');
const loginRoute = require('./user_routes/user_routes/login_route');
const logoutRoute = require('./user_routes/user_routes/logout_route');


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

server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '50mb',
    extended: true
}));
// user_app.use(cookieParser(cookie_key));
server.use(session({
    name: session_id,
    secret: session_key,
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
}));
server.use(passport.initialize());
server.use(passport.session());

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

////////////// Setup route /////////////////////////
server.use(url_prefix + '/user/signup', signupRoute);
server.use(url_prefix + '/user/login', loginRoute);
server.use(cors.cors, session_authentication);
server.use(url_prefix + '/user/logout', logoutRoute);
/*user_app.use(url_prefix + '/content/query', queryContentRoute);
user_app.use(url_prefix + '/content/recommend', queryRecommendContentRoute);
user_app.use(url_prefix + '/content/search', searchContentRoute);
user_app.use(url_prefix + '/meta/query', queryMetaRoute);
user_app.use(url_prefix + '/collection/create', createCollectionRoute);
user_app.use(url_prefix + '/collection/delete', deleteCollectionRoute);
user_app.use(url_prefix + '/collection/update', updateCollectionRoute);
user_app.use(url_prefix + '/collection/subscribe', subscribeCollectionRoute);
user_app.use(url_prefix + '/collection/unsubscribe', unSubscribeCollectionRoute);
user_app.use(url_prefix + '/collection/addcontent', addContentToCollectionRouter);
user_app.use(url_prefix + '/collection/deletecontent', deleteContentFromCollectionRoute);*/


server.use(function(req, res, next) {
    res.statusCode = 400;
    res.json({
        success: false,
        reasons: [`Invalid request on ${req.url}`],
        value: null
    });
});

server.listen(serverPort, serverIP);
console.log(`LinuxMonitor server is running at http://${serverPort}:${serverIP}`);
