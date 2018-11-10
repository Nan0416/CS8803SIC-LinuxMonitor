const cors = require('../cors');
const express = require('express');
const queryRouter = express.Router();

const overall = require('../../monitor_operations/monitor_functions').overall;


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
    function result_handler(result){
        res.statusCode = result.success?200:403;
        res.json(result);
    }
    if(typeof req.body.period === 'number'){
        overall(req.body.period, result_handler);
    }else{
        overall(result_handler);
    }
});
module.exports = queryRouter;