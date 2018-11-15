const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = [
    "http://localhost:4200"
];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    if(whitelist.indexOf(req.header('Origin')) !== -1){
        corsOptions = {origin: req.header('Origin'), credentials: true};
    }else{
        corsOptions = {origin: false};
    }
    callback(null, corsOptions);
};

module.exports.cors = cors(corsOptionsDelegate);
//module.exports.cors = cors();