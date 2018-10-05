const exec_ = require('child_process').exec;
const EventEmitter = require('events');

function decimal(number, percision){
    percision = Math.pow(10, percision);
    return Math.round(number * percision) / percision;
}

function exec(cmd, callback){
    let child = exec_(cmd, (err, stdout, stderr) => {
        if(err){
            callback(err, null);
        }else if(stdout){
            callback(null, {response: stdout});
        }else{
            callback(new Error(stderr), null);
        }
    });
}

function scheduler(arr, num_worker, task, callback){
    const sche = new EventEmitter();
    let result_list = {};
    let worker_counter = 0;
    sche.once('done', ()=>{
        callback(result_list);
    });

    sche.on('worker_complete', ()=>{
        worker_counter ++;
        if(worker_counter === num_worker){
            sche.emit('done');
        }
    });

    sche.on('next', (i)=>{
        if(i >= arr.length){
            sche.emit('worker_complete');
        }else{
            task(arr[i], (err, res)=>{
                if(err){
                    result_list[arr[i]] = err;
                }else if(res){
                    result_list[arr[i]] = res;
                }
                sche.emit('next', i+num_worker);
            }); 
        }
    });

    let temp_i = 0;
    while(temp_i < num_worker){
        sche.emit('next', temp_i);
        temp_i++;
    }
}

module.exports.scheduler = scheduler;
module.exports.decimal = decimal;
module.exports.exec = exec;