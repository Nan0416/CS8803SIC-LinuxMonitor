import { Injectable } from '@angular/core';
import { QueryService } from './query.service';
import {CPU, Memory, Overall} from '../data-structures/Metrics';
import { QueryWSService } from './query-ws.service';
import { TimeMap } from '../data-structures/TimeMap';
import {TargetOperationService } from '../services/target-operation.service';
import { Target} from '../data-structures/Target';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DataContainerService {
  
  data: Map<string, TimeMap<Overall>>;
  httpWorker: Map<string, number>;
  period : number= 15 * 60; // timemap duration (s)

  // Observable leaving/status update/ 
  private dataUpdateEvt_ = new Subject<string>();
  public dataUpdate$ = this.dataUpdateEvt_.asObservable();
  __notifyDataUpdateSubscribers(name: string){
    this.dataUpdateEvt_.next(name);
  }

  constructor(
    private queryService: QueryService,
    private queryWSService: QueryWSService,
    private targetOperator: TargetOperationService
  ) { 
    this.data = new Map();
    this.httpWorker = new Map();
  }
  init(){
    this.targetOperator.targetModification$.subscribe(()=>{
      let liveTargets = new Set<string>();
      this.targetOperator.targets.forEach((t: Target, k: string)=>{
        if(t.status === 1){
          liveTargets.add(k);
          if(!this.data.has(k)){
            this.data.set(k, new TimeMap<Overall>(this.period));
            // start ask data
            this.startHttp(k, t.ip, t.port, 1000); // 3s per request
            console.log(k + ' is on');
          }
        }
      });
      this.data.forEach((t, k: string)=>{
        if(!liveTargets.has(k)){
          // stop ask data, target is gone.
          this.stopHttp(k);
          this.data.delete(k);
          console.log(k + ' is off');
        }
      });
    });
  }
  clear(){

  }
  startHttp(name:string, ip: string, port: number, period:number){
    if(this.httpWorker.has(name)){
      clearInterval(this.httpWorker.get(name));
    }
    let id = window.setInterval(()=>{
      this.queryService.queryAll(ip, port, period).subscribe(data=>{
        if(data){
          if(this.data.has(name)){
            this.data.get(name).set(data.timestamp, data);
            this.__notifyDataUpdateSubscribers(name);
          }
        }
      });
    }, period);
    this.httpWorker.set(name, id);
  }
  stopHttp(name: string){
    if(this.httpWorker.has(name)){
      console.log("clear task");
      clearInterval(this.httpWorker.get(name));
      //this.httpWorker.delete(name);
    }
  }
  startWS(){

  }
  stopWS(){

  }
  // get latest static data
  getLatestStatistics(name: string): Overall{
    let tmp: TimeMap<Overall> = this.data.get(name)
    if(tmp){
      return tmp.getLatest();
    }else{
      return null;
    }
  }
  getStatistics(name:string): TimeMap<Overall> {
    return this.data.get(name);
  }


}
