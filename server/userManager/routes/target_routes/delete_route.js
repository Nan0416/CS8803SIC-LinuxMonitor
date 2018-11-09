const cors = require('../cors');
const express = require('express');
const deleteTargetsRouter = express.Router();

const deleteTargets = require('../../db_operations/target_db_ops').deleteTargets;


///////////////// route handler /////////////


deleteTargetsRouter.route("/")
.options(cors.cors, (req, res, next) => {
    res.sendStatus(200);
})
.post(cors.cors, (req, res, next)=>{
    deleteTargets(req.user._id, (result)=>{
        res.statusCode = result.success?200:403;
        res.json(result);
    });
});
module.exports = deleteTargetsRouter;