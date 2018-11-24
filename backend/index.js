/**
 * Backend RESTful API based on HTTP
 *  */
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const ws_prefix = require('./config').ws_prefix; 
const io = require('socket.io')(server, { path: ws_prefix});
const process = require('process');
const url_prefix = require('./config').url_prefix;

const join = require('./report').join;
const leave = require('./report').leave;

const commandLineArgs = require('command-line-args')

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
const allWorker = require('./ws_listeners/query_publishers/all_publisher')();


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
        allWorker.deleteListener(socket);
    });
    socket.on('subscribe', ()=>{
        allWorker.addListener(socket);
    });
    socket.on('update', (msg)=>{
        let newPeriod = JSON.parse(msg).period;
        if(newPeriod && newPeriod > 200){
            allWorker.updatePeriod(newPeriod);
        }
        
    });
    socket.on("unsubscribe", (msg)=>{
        socket.disconnect();
        allWorker.deleteListener(socket);
    });
});


///////// command line ////////
const optionDefinitions = [
    { name: 'name', alias: 'n', type: String },
    { name: 'port', alias: 'p', type: Number }
  ]
const options = commandLineArgs(optionDefinitions);
if(!(options.name && options.port)){
    console.log("Invalid arguments. Correct example:")
    console.log("node index.js --name DellLinux --port 9000")
    return;
}
server.listen(options.port);
console.log(`monitor server is running at http://*:${options.port}`);

join(options.name);
process.on('SIGINT', () => {
    console.log(`About to exit with code:`);
    leave(()=>{
        process.exit(0);
    });
});
