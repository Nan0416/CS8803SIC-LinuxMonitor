const getCPULoad = require('./monitor').getCPULoad;
setInterval(()=>{
    getCPULoad(100, (data)=>{
        console.log((data.overview.user + data.overview.sys) * 100);
    });
},200)
