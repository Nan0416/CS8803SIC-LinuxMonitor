
let count = 0;
const overall = require('../../monitor_operations/monitor_functions').overall;
const EventEmitter = require('events');
class Worker{
    constructor(){
        this.sockets = [];
        this.running = false;
        this.period = 1000;
        this.event_manager = new EventEmitter();
        // load bullet
        this.event_manager.on('sample', ()=>{
            overall(this.period, (result)=>{
                console.log(count++);
                for(let i = 0; i < this.sockets.length; i++){
                    this.sockets[i].emit('all', result);
                }
            });
        });
        this.event_manager.on("fire", ()=>{
            if(this.running){
                this.event_manager.emit("sample");
                setTimeout(()=>{
                    this.event_manager.emit("fire");
                }, this.period);
            }
        });
    }
    updatePeriod(period){
        console.log(period);
        this.period = period;
    }
    addListener(socket){
        console.log("add listener, " + this.sockets.length);
        if(this.sockets.length === 0){
            // fire
            this.running = true;
            
            this.event_manager.emit("fire");
            
        }
        this.sockets.push(socket);
    }
    deleteListener(socket){
        console.log("delete listener, " + this.sockets.length);
        let index = this.sockets.indexOf(socket);
        if(index === -1){
            return;
        }
        this.sockets.splice(index, 1);
        if(this.sockets.length === 0){
            this.running = false;
        }
    }
}

function createWorker(){
    return new Worker();
}
module.exports = createWorker;
