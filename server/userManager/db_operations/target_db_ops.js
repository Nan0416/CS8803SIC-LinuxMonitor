const targetDB = require('../db_models/target_db');
const userDB = require('../db_models/user_db');
const MAX_TARGET_PER_USER = require('../config').MAX_TARGET_PER_USER;
const publishTo = require('../ws_events/socket_manager').publishTo;
const useWS = require('../config').useWS;
/**
 * collection operation involves two collection: collection and user.
 */


////////////////////////////////////////////////////////////////
//////////////////// register target starts ////////////////////
////////////////////////////////////////////////////////////////
const support_protocols = new Set();
support_protocols.add('http');
support_protocols.add('ws');
function registerTarget(name, protocol, ip, port, userid, callback){
    /**
     * 1. query user
     * 2. add the target
     */
    if(! (typeof name === 'string' && typeof protocol === 'string' && 
        typeof ip === 'string' && typeof port === 'number')){
        callback({
            success: true,
            reasons:[`Invalid argument`],
            value:null
        });
        return;
    }
    userDB.findById(userid, (err, user)=>{
        if(err || !user){
            callback({
                success: false,
                reasons:[`Invalid request`],
                value: null
            });
        }else{
            if(user.targets.length >= MAX_TARGET_PER_USER){
                callback({
                    success: false,
                    reasons:[`You can monitor at most ${MAX_TARGET_PER_USER} targets`],
                    value: null
                });
            }else{
                if(!support_protocols.has(protocol)){
                    callback({
                        success: false,
                        reasons:[`Protocol ${protocol} is not supported`],
                        value: null
                    });
                    return;
                }
                targetDB.create({
                    ownerid: user._id, 
                    name: name, 
                    protocol: protocol, 
                    ip: ip, 
                    port: port}, 
                    (err, target)=>{
                        if(err){
                            callback({
                                success: false,
                                reasons:[err.message],
                                value: null
                            });
                            return;
                        }
                        user.targets.push(target._id);
                        user.save((err, result)=>{
                            if(err){
                                callback({
                                    success: false,
                                    reasons:[`Cannot make this change`],
                                    value: null
                                });
                            }else{
                                if(useWS){
                                    publishTo(user.username, 'add_target', target.toObject());
                                }
                                callback({
                                    success: true,
                                    reasons:[],
                                    value: target
                                });
                            }
                        });
                    });
            }
        }
    });
}
////////////////////////////////////////////////////////////////
//////////////////// remove target starts //////////////////////
////////////////////////////////////////////////////////////////
function deleteTarget(name, userid, callback){
    // 1. find this target
    // 2. remove the target
    targetDB.findOneAndDelete({ownerid: userid, name: name}, (err, target)=>{
        if(err){
            callback({
                success: false,
                reasons:[err.message],
                value:null
            });
        }else if(target){
            userDB.findById(userid, (err, userInfo)=>{
                if(err){
                    callback({
                        success: false,
                        reasons:[err.message],
                        value:null,
                    });
                }else if(userInfo){
                    let index = userInfo.targets.indexOf(target._id);
                    userInfo.targets.splice(index, 1);
                    userInfo.save((err, newUser)=>{
                        if(err){
                            callback({
                                success: false,
                                reasons:[err.message],
                                value:null
                            });
                        }else{
                            publishTo(userInfo.username, 'delete_target', target.toObject());
                            callback({
                                success: true,
                                reasons: [],
                                value:null
                            });
                        }
                    });
                }else{
                    callback({
                        success: false,
                        reasons:[`Cannot find user`],
                        value:null,
                    });
                }
            })
        }else{
            callback({
                success: true,
                reasons:[`Not found`],
                value:null
            });
        }
    });
}
////////////////////////////////////////////////////////////////
//////////////////// modify collections starts /////////////////
////////////////////////////////////////////////////////////////
/**
 * 
 * @param {*} modification {
 *  name: string,
 *  : text,
 *  profile: string,
 *  
 * }
 * @param {*} callback 
 */
function checkModification(modification){
    if(!modification){
        return false;
    }
    if(modification.protocol && !support_protocols.has(modification.protocol)){
        return false;
    }
    return true;
}
function modifyTarget(name, userid, modification, callback){
    if(!checkModification(modification)){
        callback({
            success: false,
            reasons:[`Invalid Modification`],
            value:null
        });
        return;
    }
    userDB.findById(userid, (err, user)=>{
        if(err || !user){
            callback({
                success: false,
                reasons:[`Invalid request`],
                value: null
            });
        }else{    
            isFound = false;
            for(let i = 0; i < user.targets.length; i++){
                if(user.targets[i].name === name){
                    if(typeof modification.name === 'string'){
                        user.targets[i].name = name;
                    }
                    if(typeof modification.protocol === 'string'){
                        user.targets[i].protocol = protocol;
                    }
                    if(typeof modification.ip === 'string'){
                        user.targets[i].ip = ip;
                    }
                    if(typeof modification.port === 'number'){
                        user.targets[i].port = port;
                    }
                    break;
                }
            }
            if(isFound){
                // save
                user.save((err, result)=>{
                    if(err){
                        callback({
                            success: false,
                            reasons:[`Cannot make this change`],
                            value: null
                        });
                    }else{
                        callback({
                            success: true,
                            reasons:[],
                            value: null
                        });
                    }
                });
            }else{
                callback({
                    success: false,
                    reasons:[`Cannot find ${name} target`],
                    value: null
                });
            }
        }
    });
}
/////////////////////////////////////////////////////////////////////////
////////////////// query all targets ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
function queryTargets(userid, callback){
    userDB.findById(userid)
    .populate('targets')
    .exec((err, user)=>{
        if(err || !user){
            callback({
                success: false,
                reasons:[`Invalid request`],
                value: null
            });
        }else{    
            callback({
                success: true,
                reasons:[],
                value: user.targets
            });
        }
    });
}

module.exports.registerTarget = registerTarget;
module.exports.deleteTarget = deleteTarget;
module.exports.modifyTarget = modifyTarget;
module.exports.queryTargets = queryTargets;
