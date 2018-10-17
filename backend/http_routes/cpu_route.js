const cors = require('./cors');
const express = require('express');
const queryRouter = express.Router();

const query_cpu = require('../monitor_operations/monitor_functions').CPU;


///////////////// route handler /////////////
/**
 * body
 * {period: number}
 */

queryRouter.route("/")
.options(cors.cors, (req, res, next) => {
    res.sendStatus(200);
})
.post(cors.cors, (req, res, next)=>{
    if(typeof req.body.period === 'number'){
        query_cpu(req.body.period, (err, result)=>{
            if(err){
                res.statusCode = 500;
                res.json({
                    success: false,
                    reasons: [err.message],
                    value: null
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
        query_cpu((err, result)=>{
            if(err){
                res.statusCode = 500;
                res.json({
                    success: false,
                    reasons: [err.message],
                    value: null
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
    }
});
module.exports = queryRouter;