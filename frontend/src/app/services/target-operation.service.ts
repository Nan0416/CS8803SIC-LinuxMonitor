import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,of, Subscriber, Subject} from 'rxjs';
import { Result } from '../data-structures/GeneralResult';
import { Target, SessionTarget } from '../data-structures/Target';
import {server_addr, url_prefix} from './config';
import * as socketIo from 'socket.io-client';
import {ws_prefix} from './config';
@Injectable({
  providedIn: 'root'
})

export class TargetOperationService {


  service_url:string = server_addr + url_prefix;
  targets: Map<String, Target> = new Map();
  last_modified_target: Target = null;

  // Observable leaving/status update/ 
  private targetModificationEvt_ = new Subject<null>();
  public targetModification$ = this.targetModificationEvt_.asObservable();
  private socket = null;
  constructor(
    private http: HttpClient
  ) { 
   this.ws_open();
  }
  __notifyTargetModificationSubscribers(){
    this.targetModificationEvt_.next();
  }

  queryTargets(){
    const httpObserver = {
      next: data=>{
        if(data.success && data.value){
          for(let i = 0; i < data.value.length; i++){
            let target: Target = {
              name: data.value[i].name,
              protocol: data.value[i].protocol,
              ip: data.value[i].ip,
              port: data.value[i].port,
              status: data.value[i].status
            };
            this.targets.set(data.value[i].name, target);
            this.last_modified_target = target;
          }
          this.__notifyTargetModificationSubscribers();
        }
      },
      error: err=>{
        
      }
    };
    let queryTargets = `${this.service_url}/target/query`;
    this.http.post(queryTargets, {}, {withCredentials: true }).subscribe(httpObserver);
  }
  registerTarget(name: string, protocol: string, ip: string, port: Number): Observable<SessionTarget>{
    const registerTarget: Observable<SessionTarget> = new Observable((observor)=>{
      const httpObserver = {
        next: data=>{
          if(data.success){
            let target: Target = {
              name: data.value.name,
              protocol: data.value.protocol,
              ip: data.value.ip,
              port: data.value.port,
              status: data.value.status
            };
            observor.next({
              sessionid: "",
              reasons:[],
              success: true,
              value: target
            });
            // nofity
            this.targets.set(target.name, target);
            this.last_modified_target = target;
            this.__notifyTargetModificationSubscribers();

          }else{
            observor.next({
              sessionid: "",
              reasons:data.reasons,
              success: false,
              value: null
            });
          }
        },
        error: err=>{
          observor.next({
            sessionid: "",
            reasons:[err.message],
            success: false,
            value: null
          });
        }
      };
      let registerTargetUrl = `${this.service_url}/target/register`;
      let body = {
        name: name,
        protocol: protocol,
        ip:ip,
        port: port
      };
      this.http.post(registerTargetUrl, body, {withCredentials: true }).subscribe(httpObserver);
    });
    return registerTarget;
  }
  public ws_open():void{
    this.socket = socketIo(server_addr, {path: ws_prefix});
  }
  public ws_close(): void{
    if(this.socket !== null){
      this.socket.close();
      this.socket = null;
    }
  }
  public ws_subscribe(): void {
    if(this.socket === null){
      return;
    }
    this.socket.on('target', (data)=>{
      let target: Target = {
          name: data.name,
          protocol: data.protocol,
          ip: data.ip,
          port: data.port,
          status: data.status
      };
      this.last_modified_target = target;
      this.targets.set(target.name, target);
      this.__notifyTargetModificationSubscribers();
    });
    this.socket.emit('subscribe');
  }
  

  removeTarget(name: string): Observable<Result>{
    const removeReq: Observable<Result> = new Observable((observor)=>{});
    return removeReq;
  }
}
