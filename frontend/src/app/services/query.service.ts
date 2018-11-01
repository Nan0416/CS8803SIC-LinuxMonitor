import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,of} from 'rxjs';
import { SessionCPU, CPU } from '../data-structures/CPU';
import {target_server_addr, restapi_prefix } from './config';

@Injectable({
  providedIn: 'root'
})

export class QueryService {
  
  monitor_server_url :string = target_server_addr + restapi_prefix;
  
  constructor(
    private http: HttpClient,
  ) { 
    console.log('[QueryService] New Service Created');
  }
  
  queryCPU(sessionId: string): Observable<SessionCPU>{
    const cpu: Observable<SessionCPU> = new Observable((observable)=>{
      const httpObserver = {
          next: data=>{
            observable.next({
              sessionid : sessionId, 
              success: true, 
              reasons:data.success? []: data.reasons,
              cpu: data.success? data.value: null});
          },
          error: err=>{
            observable.next({
              sessionid: sessionId, 
              success: false,
              reasons: [err.message],
              cpu: null
            });
          }
      }
      /////// query now ///////////
      let queryUrl = `${this.monitor_server_url}/query/cpu`;
      this.http.post<CPU>(queryUrl, {period: 300}).subscribe(httpObserver);
    });
    return cpu;
  }

  
}


