export class Target{
    name: string;
    protocol: string;
    ip: string;
    port: number;
    status: number; // 0 register, 1 running
}
export class TargetInfo{
    name: string;
    hostname: string;
    arch: string;
    kernel: string;
    num_core: number;
    model: string;
}
export class SessionTarget{
    sessionid: string;
    value: Target;
    success: boolean;
    reasons: string[];
}
