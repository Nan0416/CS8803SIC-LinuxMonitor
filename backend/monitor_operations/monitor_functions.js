const os = require('os');
const decimal = require('./helper_functions').decimal;
const fs = require('fs');
/**
 * 
 * @param {*} [period] A millisecond time period, default 100
 * @param {*} callback A callback function whose arguments are err and the cpu load
 */
function CPU(period, callback){
    if(typeof period === 'function'){
        callback = period;
        period = 100;
    }
    let t1 = os.cpus();
    console.log(period)
    setTimeout(()=>{
        console.log(period)
        let t2 = os.cpus();
        let result = [];
        for(let i = 0; i < t1.length; i++){
            result.push(__loadPerCore(t1[i].times, t2[i].times));
        }
        let overview = {user: 0, sys: 0};
        for(let i = 0; i < result.length; i++){
            overview.user += result[i].user;
            overview.sys += result[i].sys;

            result[i].user = decimal(result[i].user, 4);
            result[i].sys = decimal(result[i].sys, 4);
        }
        overview.user = decimal(overview.user / result.length , 4);
        overview.sys = decimal(overview.sys / result.length, 4);
        callback(null, {
            overview: overview,
            cores: result,
            corenum: result.length
        })
    }, period);
    //clearInterval(timeout_);
}
function __loadPerCore(t1, t2){
    //{ user: 73130, nice: 0, sys: 58950, idle: 16388980, irq: 0 }
    let diff_user = t2.user - t1.user;
    let diff_sys = t2.sys - t1.sys;
    let diff_idle = t2.idle - t1.idle;
    let sum = (diff_idle + diff_sys + diff_user);
    return {
        user: (diff_user / sum), 
        sys: (diff_sys/ sum)
    };
}

/////////////////////////////////////////////////////////////////////////////////////
//////////////////////// Memory /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

function memory(callback){
    const filepath = '/proc/meminfo';
    fs.readFile(filepath, (err, data)=>{
        if(err){
            callback(err);
            return;
        }
        let items = data.toString('utf8').split('\n');
        const required_fields = new Set([
            "MemTotal:", 
            "MemFree:", 
            "MemAvailable:",
            "Buffers:",
            "Cached:",
            "SwapTotal:",
            "SwapFree:",
        ]);
        const value = {};
        for(let i = 0; i < items.length; i++){
            let str = items[i].split(' ');
            if(required_fields.has(str[0])){
                let key = str[0].substring(0, str[0].length - 1);
                value[key] = parseInt(str[str.length - 2]);
            }
        }
        callback(null, value);
    })
}

module.exports.memory = memory;
module.exports.CPU = CPU;