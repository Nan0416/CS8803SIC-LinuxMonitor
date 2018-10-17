const cors = require('../cors');
const express = require('express');
const testRouter = express.Router();

const test_latency = require('../../monitor_operations/tools_functions').ping;


///////////////// route handler /////////////
/**
 * body
 * {targets: [string]}
 */

testRouter.route("/")
.options(cors.cors, (req, res, next) => {
    res.sendStatus(200);
})
.post(cors.cors, (req, res, next)=>{
    if(Array.isArray(req.body.targets)){
        test_latency(req.body.targets, (err, result)=>{
            if(err){
                res.statusCode = 400;
                res.json({
                    success: false,
                    reasons: [err.message],
                    value: result
                });
            }else{
                res.statusCode = 200;
                res.json({
                    success: true,
                    reasons:[],
                    value: result
                });
            }
        });
    }else{
        res.statusCode = 400;
        res.json({
            success: false,
            reasons: [`Please give an array of targets`],
            value: null
        });
    }
});
module.exports = testRouter;