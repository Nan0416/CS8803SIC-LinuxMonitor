export class Result{
    value:string;
    reasons:string[];
    success: boolean;
}
export class SessionResult{
    sessionid: string;
    result: Result;
}