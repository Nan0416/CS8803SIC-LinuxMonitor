import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,of, Subscriber, Subject} from 'rxjs';
import { Result } from '../data-structures/GeneralResult';
import { Target, TargetInfo,SessionTarget } from '../data-structures/Target';
import {server_addr, url_prefix} from './config';
import * as socketIo from 'socket.io-client';
import {ws_prefix, target_restapi_prefix} from './config';
import { UserOperationService } from './user-operation.service';
@Injectable({
  providedIn: 'root'
})

export class TargetOperationService {


  service_url:string = server_addr + url_prefix;
  targets: Map<String, Target> = new Map();
  targetInfo:Map<String, TargetInfo> = new Map();
  last_modified_target: Target = null;

  // Observable leaving/status update/ 
  private targetModificationEvt_ = new Subject<null>();
  public targetModification$ = this.targetModificationEvt_.asObservable();
  private socket = null;
  constructor(
    private http: HttpClient,
    private userOperator: UserOperationService
  ) { 
   this.ws_open();
   userOperator.userUnMount$.subscribe(()=>{
     this.targets.clear();
     this.targetInfo.clear();
     this.last_modified_target = null;
     console.log('User logout')
     this.__notifyTargetModificationSubscribers();
   })
  }
  __notifyTargetModificationSubscribers(){
    this.targetModificationEvt_.next();
  }
  queryTargetInfo(target_name: string): Observable<TargetInfo>{
    let t: Target = this.targets.get(target_name);
    if(!t){
      return;
    }
    const queryTargetInfo: Observable<TargetInfo> = new Observable((observor)=>{
      const httpObserver = {
        next: data=>{
          if(data.success && data.value){
            let targetInfo: TargetInfo = {
              name: target_name,
              hostname: data.value.hostname,
              num_core: data.value['#core'],
              arch: data.value.arch,
              kernel: data.value.kernel,
              model: data.value.model,
            }
            this.targetInfo.set(target_name, targetInfo);
            observor.next(targetInfo);
          }
          observor.next(null);
        },
        error: err=>{
          observor.next(null);
        }
      };
      let queryTargetInfo = `http://${t.ip}:${t.port}${target_restapi_prefix}/query/systeminfo`;
      this.http.post(queryTargetInfo, {}, {withCredentials: true }).subscribe(httpObserver);
    });
    return queryTargetInfo;
  }
  
  queryTargets(){
    const httpObserver = {
      next: data=>{
        if(data.success && data.value){
          this.targets.clear();
          this.last_modified_target = null;
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
            // this.__notifyTargetModificationSubscribers();

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
    this.socket.on('add_target', (data)=>{
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
    this.socket.on('modify_target', (data)=>{
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
    this.socket.on('delete_target', (target)=>{
      this.targets.delete(target.name);
      this.__notifyTargetModificationSubscribers();
    });
    this.socket.emit('subscribe');
  }
  

  deleteTarget(name: string): Observable<Result>{
    const removeReq: Observable<Result> = new Observable((observor)=>{
      const httpObserver = {
        next: data=>{
          if(data.success){
            //this.queryTargets();
          }
          observor.next({
            success: data.succes,
            value: data.success? data.value: null,
            reasons: data.reasons
          });
        },
        error: err=>{
          observor.next({
            success: false,
            value: null,
            reasons: [err.message]
          })
        }
      };
      let deleteTargetUrl = `${this.service_url}/target/delete`;
      let body = {
          target_name: name,
      };
      this.http.post(deleteTargetUrl, body, {withCredentials: true }).subscribe(httpObserver);
    });
    return removeReq;
  }
}
