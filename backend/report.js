const request = require('request');
const username = require('./config').username;
const password = require('./config').password;
const target_name = require('./config').target_name;
function join(){
    let options = {
      uri: "http://monitor.sousys.com/user/api/target/report",
      method:"POST",
      json:{
        username: username,
        target_name: target_name,
        target_status:1,
        password: password
      }
    };
    request(options, (err, res, body)=>{
      if(err){
        console.log(`Fail to notify the server: ${err.message}`);
      }else if(res.statusCode == 200){
        console.log("Notified central server");
      }else{
        console.log("Report error: " + res.statusCode);
      }
    });
}
function leave(callack){
  let options = {
    uri: "http://monitor.sousys.com/user/api/target/report",
    method:"POST",
    json:{
      username: username,
      target_name: target_name,
      target_status:0,
      password: password
    }
  };
  request(options, (err, res, body)=>{
    if(err){
      console.log(`Fail to notify the server: ${err.message}`);
    }else if(res.statusCode == 200){
      console.log("Notified central server");
    }else{
      console.log("Report error: " + res.statusCode);
    }
    callack();
  });
}
module.exports.join = join;
module.exports.leave = leave;