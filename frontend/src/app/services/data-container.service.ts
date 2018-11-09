import { Injectable } from '@angular/core';
import { QueryService } from './query.service';
import {CPU, Memory, Overall} from '../data-structures/Metrics';
import { QueryWSService } from './query-ws.service';
import { TimeMap } from '../data-structures/TimeMap';
import {TargetOperationService } from '../services/target-operation.service';
import { Target} from '../data-structures/Target';
@Injectable({
  providedIn: 'root'
})
export class DataContainerService {
  
  data: Map<string, TimeMap<Overall>>;
  period : number= 0;

  constructor(
    private queryService: QueryService,
    private queryWSService: QueryWSService,
    private targetOperator: TargetOperationService
  ) { 
    this.data = new Map();
  }
  init(){
    this.targetOperator.targetModification$.subscribe(()=>{
      let liveTargets = new Set<string>();
      this.targetOperator.targets.forEach((t: Target, k: string)=>{
        liveTargets.add(k);
        if(!this.data.has(k)){
          this.data.set(k, new TimeMap<Overall>(this.period));
          // start ask data
          
        }
      });
      this.data.forEach((t, k: string)=>{
        if(!liveTargets.has(k)){
          // stop ask data, target is gone.

        }
      });
    });
  }

  startHttp(){

  }
  stopHttp(){

  }
  startWS(){

  }
  stopWS(){

  }


}
