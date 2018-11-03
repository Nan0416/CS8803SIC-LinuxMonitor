const sockets = new Map();
function addSocket(username, socket){
    if(sockets.has(username)){
        sockets.get(username).add(socket);
    }else{
        let s = new Set();
        s.add(socket);
        sockets.set(username, s);
    }
}

function deleteSocket(username, socket){
    if(sockets.has(username)){
        sockets.get(username).delete(socket);
    }
}

function publishTo(username, data){
    if(sockets.has(username)){
        sockets.get(username).forEach(socket => {
            socket.emit('target', data);
        });
    }
}


module.exports.addSocket = addSocket;
module.exports.deleteSocket = deleteSocket;
module.exports.publishTo = publishTo;