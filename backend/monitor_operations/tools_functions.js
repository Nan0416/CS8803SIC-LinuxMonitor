const exec = require('./helper_functions').exec;
const scheduler = require('./helper_functions').scheduler;
function ping(targets, callback){
    if(typeof targets === 'string'){
        targets = [targets];
    }
    scheduler(targets, 5, (target_ip, callback)=>{
        exec(`ping ${target_ip} -c 3`, (err, resp)=>{
            if(err){
                callback(err);
            }else{
                let data = resp.response.split('\n');
                data =  parseFloat(data[data.length - 2].split('/')[4]);
                callback(null,data);
            }
        });
    }, callback);
}

ping([
    "google.com",
    "baidu.com",
    "yelp.com"
], console.log);