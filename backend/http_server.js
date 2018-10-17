/**
 * Backend RESTful API based on HTTP
 *  */
const express = require('express');
const rest_api = express();

const monitor_ip = "192.168.0.112";
const monitor_port = 3000;
const url_prefix = "/restapi";

// query
const queryCPU = require('./http_routes/query_routes/cpu_route');
const queryMemory = require('./http_routes/query_routes/memory_route');

// test
const testLatency = require('./http_routes/test_routes/ping_route');

///////// Express configuration //////////
const logger = require('morgan');
const bodyParser = require('body-parser');

rest_api.use(logger('dev'));
rest_api.use(bodyParser.json());
rest_api.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    limit: '50mb',
    extended: true
}));



rest_api.use(url_prefix + '/query/cpu', queryCPU);
rest_api.use(url_prefix + '/query/memory', queryMemory);

rest_api.use(url_prefix + '/test/latency', testLatency);

// unrecognized path
rest_api.use(function(req, res, next) {
    res.statusCode = 400;
    res.json({
        success: false,
        reasons:[`Invalid url path ${req.originalUrl}`],
        value:null
    });
});
  



rest_api.listen(monitor_port, monitor_ip);
console.log(`monitor (RESTful) server is running at http://${monitor_ip}:${monitor_port}`);
