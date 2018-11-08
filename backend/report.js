const request = require('request');
const username = require('./config').username;
const target_name = require('./config').target_name;
function join(){
    let options = {
      uri: "http://monitor.sousys.com/user/api/target/report",
      method:"POST",
      json:{
        username: username,
        target_name: target_name,
        target_status:1
      }
    };
    request(options, (err, res, body)=>{
      if(err){
        console.log(`Fail to notify the server: ${err.message}`);
      }else{
        console.log(body);
      }
    });
}
function leave(){
  let options = {
    uri: "http://monitor.sousys.com/user/api/target/report",
    method:"POST",
    json:{
      username: username,
      target_name: target_name,
      target_status:0
    }
  };
  request(options, (err, res, body)=>{
    if(err){
      console.log(`Fail to notify the server: ${err.message}`);
    }else{
      console.log(body);
    }
  });
}
module.exports.join = join;
module.exports.leave = leave;