/**
 * /query
 * query targets
 * 
 */

const cors = require('../cors');
const express = require('express');
const queryTargetsRouter = express.Router();

const queryTargets = require('../../db_operations/target_db_ops').queryTargets;


///////////////// route handler /////////////


queryTargetsRouter.route("/")
.options(cors.cors, (req, res, next) => {
    res.sendStatus(200);
})
.post(cors.cors, (req, res, next)=>{
    queryTargets(req.user._id, (result)=>{
        res.statusCode = result.success?200:403;
        res.json(result);
    });
});
module.exports = queryTargetsRouter;