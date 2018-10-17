/**
 * Backend RESTful API based on HTTP
 *  */
const express = require('express');
const createError = require('http-errors');
const rest_api = express();

const monitor_ip = "192.168.0.1";
const monitor_port = 3000;
const url_prefix = "/rest/api";

// content
const queryCPU = require('./http_routes/cpu_route');

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


rest_api.use(function(req, res, next) {
    next(createError(404));
});
  
  // error handler
rest_api.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.end(err.message);
});


rest_api.listen(monitor_port, monitor_ip);
console.log(`monitor (RESTful) server is running at http://${monitor_ip}:${monitor_port}`);
