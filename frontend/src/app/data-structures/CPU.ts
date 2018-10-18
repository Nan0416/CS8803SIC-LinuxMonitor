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
    time: number;
}
export class SessionCPU{
    sessionid: string;
    success: boolean;
    reasons: string[];
    cpu: CPU;
}
