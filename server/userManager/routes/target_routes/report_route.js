/**
 * target report its status to the server e.g. running, stop
 */

const cors = require('../cors');
const express = require('express');
const reportTargetRouter = express.Router();

const modifyTargetStatus = require('../../db_operations/user_db_ops').modifyTargetStatus;


///////////////// route handler /////////////


reportTargetRouter.route("/")
.options(cors.cors, (req, res, next) => {
   res.sendStatus(200);
})
.post(cors.cors, (req, res, next)=>{
    modifyTargetStatus(req, res, (result)=>{
           res.statusCode = result.success?200:403;
           res.json(result);
   });
});
module.exports = reportTargetRouter;