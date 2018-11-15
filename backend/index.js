/**
 * Backend RESTful API based on HTTP
 *  */
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const ws_prefix = require('./config').ws_prefix; 
const io = require('socket.io')(server, { path: ws_prefix});
const process = require('process');

const ip = require('./config').ip;
const port = require('./config').port;
const url_prefix = require('./config').url_prefix;

const join = require('./report').join;
const leave = require('./report').leave;

// query
const queryCPU = require('./http_routes/query_routes/cpu_route');
const queryMemory = require('./http_routes/query_routes/memory_route');
const queryLoad = require('./http_routes/query_routes/system_load_route');
const querySystemInfo = require('./http_routes/query_routes/systeminfo_route');
const queryNetworkIO = require('./http_routes/query_routes/network_io_route');
const queryDiskIO = require('./http_routes/query_routes/disk_io_route');
const queryAll = require('./http_routes/query_routes/all_route');
// test
const testLatency = require('./http_routes/test_routes/ping_route');

// websocket query listener
const addAllListener = require('./ws_listeners/query_publishers/all_publisher').addAllListener;
const deleteAllListener = require('./ws_listeners/query_publishers/all_publisher').deleteAllListener;
const updateAllSampleRate = require('./ws_listeners/query_publishers/all_publisher').updateAllSampleRate;

///////// Express configuration //////////
const logger = require('morgan');
const bodyParser = require('body-parser');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '50mb',
    extended: true
}));

const cors = require('./http_routes/cors');
app.use(cors.cors);
app.use(url_prefix + '/query/cpu', queryCPU);
app.use(url_prefix + '/query/memory', queryMemory);
app.use(url_prefix + '/query/load', queryLoad);
app.use(url_prefix + '/query/systeminfo', querySystemInfo);
app.use(url_prefix + '/query/networkio', queryNetworkIO);
app.use(url_prefix + '/query/diskio', queryDiskIO);
app.use(url_prefix + '/query/all', queryAll);
// test
app.use(url_prefix + '/test/latency', testLatency);


  
io.on('connection', (socket)=>{
    if(false){
        // verification goes here
        return;
    }
    socket.on('disconnect', ()=>{
        deleteAllListener(socket);
    });
    socket.on('subscribe', ()=>{
        addAllListener(socket);
    });
    socket.on('update', (msg)=>{
        updateAllSampleRate(msg.period);
    });
    socket.on("unsubscribe", (msg)=>{
        socket.disconnect();
        deleteAllListener(socket);
    });
});

server.listen(port);
console.log(`monitor server is running at http://*:${port}`);
if(process.argv.length >= 3){
	join(process.argv[2]);
}else{
	join(null);
}

process.on('SIGINT', () => {
    console.log(`About to exit with code:`);
    leave(()=>{
        process.exit(0);
    });
});
