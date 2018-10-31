/**
 * /register
 * register target
 * 
 */

const cors = require('../cors');
const express = require('express');
const registerTargetRouter = express.Router();

const registerTarget = require('../../db_operations/target_db_ops').registerTarget;


///////////////// route handler /////////////


registerTargetRouter.route("/")
.options(cors.cors, (req, res, next) => {
    res.sendStatus(200);
})
.post(cors.cors, (req, res, next)=>{
    registerTarget(
        req.body.name, 
        req.body.protocol, 
        req.body.ip, 
        req.body.port, 
        req.user._id.toString() , 
        (result)=>{
            res.statusCode = result.success?200:403;
            res.json(result);
    });
});
module.exports = registerTargetRouter;