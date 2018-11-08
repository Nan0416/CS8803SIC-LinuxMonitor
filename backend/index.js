/**
 * Backend RESTful API based on HTTP
 *  */
const express = require('express');
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const ip = require('./config').ip;
const port = require('./config').port;
const url_prefix = "/restapi";

const join = require('./report').join;
const leave = require('./report').leave;

// query
const queryCPU = require('./http_routes/query_routes/cpu_route');
const queryMemory = require('./http_routes/query_routes/memory_route');
const querySystemInfo = require('./http_routes/query_routes/systeminfo_route');
const queryNetworkIO = require('./http_routes/query_routes/network_io_route');
const queryDiskIO = require('./http_routes/query_routes/disk_io_route');
// test
const testLatency = require('./http_routes/test_routes/ping_route');

///////// Express configuration //////////
const logger = require('morgan');
const bodyParser = require('body-parser');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '50mb',
    extended: true
}));



app.use(url_prefix + '/query/cpu', queryCPU);
app.use(url_prefix + '/query/memory', queryMemory);
app.use(url_prefix + '/query/systeminfo', querySystemInfo);
app.use(url_prefix + '/query/networkio', queryNetworkIO);
app.use(url_prefix + '/query/diskio', queryDiskIO);
// test
app.use(url_prefix + '/test/latency', testLatency);

// unrecognized path
app.use(function(req, res, next) {
    res.statusCode = 400;
    res.json({
        success: false,
        reasons:[`Invalid url path ${req.originalUrl}`],
        value:null
    });
});
  
io.on('connection', (socket)=>{
    if(false){
        // verification goes here
        return;
    }
    socket.on('disconnect', (msg)=>{
        //deleteSocket(username, socket);
    });
    socket.on('subscribe', (msg)=>{
        //addSocket(username, socket);
    });
    socket.on("unsubscribe", (msg)=>{

    });
});

app.listen(port, ip);
console.log(`monitor server is running at http://${ip}:${port}`);
join();

process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
});