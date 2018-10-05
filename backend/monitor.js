const os = require('os');
const decimal = require('./helper_functions').decimal;
/**
 * 
 * @param {*} period A millisecond time period
 * @param {*} callback A callback function whose argument is the cpu load
 */
function getCPULoad(period, callback){
    let t1 = os.cpus();
    setTimeout(()=>{
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
        callback({
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

module.exports.getCPULoad = getCPULoad;