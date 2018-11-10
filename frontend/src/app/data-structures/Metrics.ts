/**
 *  {
        "overview": {
            "user": 0,
            "sys": 0
        },
        "cores": [
            {
                "user": 0,
                "sys": 0
            },
            {
                "user": 0,
                "sys": 0
            },
            {
                "user": 0,
                "sys": 0
            },
            {
                "user": 0,
                "sys": 0
            }
        ],
        "corenum": 4
    }
 */
export class core{
    user: number;
    sys: number;
}
export class CPU{
    overview: core;
    cores: core[];
    corenum: number;
    timestamp: number;
}
/*{
    loadavg:[

    ],
    loadavg_per_core:[
        
    ]
}*/
export class Load{
    loadavg: number[];
    loadavg_per_core: number[];
    timestamp:number;
}
/**
 * MemTotal:
 */
export class Memory{
    MemTotal: number;
    MemFree: number;
    MemAvailable:number;
    Buffers:number;
    Cached:number;
    SwapTotal:number;
    SwapFree: number;
    timestamp:number;
}
export class DiskSection{
    name: string;
    read:number;
    write:number;
}
export class DiskIO{
    timestamp: number;
    disk_io: DiskSection[];
}
export class NetworkSection{
    name:string;
    in:number;
    out:number;
}
export class NetworkIO{
    timestamp:number;
    network_io: NetworkSection[];
}
export class Overall{
    loadavg: Load;
    CPU: CPU;
    memory: Memory;
    diskIO: DiskIO;
    networkIO: NetworkIO;
    timestamp:number;
}

