const cors = require('../cors');
const express = require('express');
const deleteTargetsRouter = express.Router();

const deleteTarget = require('../../db_operations/target_db_ops').deleteTarget;


///////////////// route handler /////////////


deleteTargetsRouter.route("/")
.options(cors.cors, (req, res, next) => {
    res.sendStatus(200);
})
.post(cors.cors, (req, res, next)=>{
    deleteTarget(req.body.target_name, req.user._id.toString(), (result)=>{
        res.statusCode = result.success?200:403;
        res.json(result);
    });
});
module.exports = deleteTargetsRouter;