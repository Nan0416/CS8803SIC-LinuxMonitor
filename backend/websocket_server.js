const http = require('http');
const ws = require('socket.io');
const ws_monitor_ip = "192.168.0.112";
const ws_monitor_port = 4000;

const CPUPublisher = require('./ws_listeners/query_publishers/cpu_publisher')();

let httpBaseServer = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
});
httpBaseServer.listen(ws_monitor_port, ws_monitor_ip, () => {
    console.log((new Date()) + ` Server is listening on ws://${ws_monitor_ip}:${ws_monitor_port}`);
});
 
let wsServer = new ws(httpBaseServer);
wsServer.on('connection', (socket)=>{
    socket.on('disconnect', ()=>{
        console.log('stopped');
        CPUPublisher.unsubscribe(socket);
    });
    socket.on('subscribe', (msg)=>{
        let content = JSON.parse(msg);
        if(typeof content.item === 'string'){
            switch(content.item){
                case "CPU":{
                    console.log("Subscribe cpu", content.frequency);
                    CPUPublisher.subscribe(socket, content.frequency, socket);
                };break;
                default:{
                    socket.emit('errReq', `Unrecognized subscribe content: ${msg}`);
                };break;
            }
        }else{
            socket.emit('errReq', `Unrecognized subscribe content: ${msg}`);
        }
    });
 console.log('connected');
});
