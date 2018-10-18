// 1. one object, one worker, multiple subscriber
const query_cpu = require('../../monitor_operations/monitor_functions').CPU;

class CPUPublisher{
    constructor(){
        this.subscribers = new Map(); // string name, object receiver
        this.publish_freq = new Map(); // string name, freq
        this.last_publish = new Map();
        this.data = null;
        this.default_freq = 300;
        this.min_frequency = this.default_freq; // running
        this.running = false;
        this.task = null;
    }
    unsubscribe(name){
        if(this.subscribers.has(name)){
            this.subscribers.delete(name);
            this.publish_freq.delete(name);
            this.last_publish.delete(name);
        }
        if(this.subscribers.size === 0){
            this.min_frequency = this.default_freq;
            clearInterval(this.task);
        }
    }
    publish(){
        let cur_time = Date.now();

        for(let [name, subscriber] of this.subscribers){
            if(this.last_publish.has(name)){
                if(cur_time >= this.last_publish.get(name) + this.publish_freq.get(name)){
                    this.last_publish.set(name, cur_time);
                    console.log("Publish cpu");
                    subscriber.emit('CPU', this.data);
                }
            }else{
                this.last_publish.set(name, cur_time);
                console.log("Publish cpu");
                subscriber.emit('CPU', this.data);
            }
        }
    }
    subscribe(name, freq, subscriber){
        if(typeof freq !== 'number'){
            subscriber = freq;
            freq = this.default_freq;
        }
        this.subscribers.set(name, subscriber);
        this.publish_freq.set(name, freq);
        if(this.running){
            // may update frequency
            if(freq < this.min_frequency){
                this.min_frequency = freq;
                clearInterval(this.task);
                this.task = setInterval(()=>{
                    query_cpu(this.min_frequency, (err, result)=>{
                        if(err){
                            this.data = {
                                success: false,
                                reasons: [err.message],
                                value: null
                            };
                        }else{
                            this.data = {
                                success: true,
                                reasons:[],
                                value: result
                            };
                        }
                        this.publish();
                    });
                }, this.min_frequency);
            }
        }else{
            if(freq < this.min_frequency){
                this.min_frequency = freq;
            }
            this.task = setInterval(()=>{
                query_cpu(this.min_frequency, (err, result)=>{
                    if(err){
                        this.data = {
                            success: false,
                            reasons: [err.message],
                            value: null
                        };
                    }else{
                        this.data = {
                            success: true,
                            reasons:[],
                            value: result
                        };
                    }
                    this.publish();
                });
            }, this.min_frequency);
        }
    }
}
module.exports = ()=>{
    return new CPUPublisher();
};