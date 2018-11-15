
const __sockets = [];
let __period = 1000;
let worker;
let isRunning = false;
let count = 0;
const overall = require('../../monitor_operations/monitor_functions').overall;
function addAllListener(socket){
    if(__sockets.length === 0){
        // start
        worker = setInterval(()=>{
            isRunning = true;
            overall(__period, (result)=>{
                console.log(count++);
                for(let i = 0; i < __sockets.length; i++){
                    __sockets[i].emit('all', result);
                }
            });
        }, __period);
    }
    __sockets.push(socket);
}
function deleteAllListener(socket){
    let index = __sockets.indexOf(socket);
    if(index === -1){
        return;
    }
    __sockets.splice(index, 1);
    if(__sockets.length === 0){
        // stop
        if(isRunning){
            isRunning = false;
            clearInterval(worker);
        }
    }
}
function updateAllSampleRate(period){
    __period = period;
    if(isRunning){
        clearInterval(worker);
        worker = setInterval(()=>{
            isRunning = true;
            overall(__period, (result)=>{
                for(let i = 0; i < __sockets.length; i++){
                    __sockets[i].emit('all', result);
                }
            });
        }, __period);
    }
}
module.exports.addAllListener = addAllListener;
module.exports.deleteAllListener = deleteAllListener;
module.exports.updateAllSampleRate = updateAllSampleRate;