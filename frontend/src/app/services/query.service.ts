import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,of} from 'rxjs';
import { Overall } from '../data-structures/Metrics';
import {target_restapi_prefix } from './config';

@Injectable({
  providedIn: 'root'
})

export class QueryService {
  
  constructor(
    private http: HttpClient,
  ) { 
    
  }
  queryAll(ip: string, port:number, period:number): Observable<Overall>{
    const all: Observable<Overall> = new Observable((observable)=>{
      const httpObserver = {
          next: data=>{
            observable.next(data.value);
          },
          error: err=>{
            observable.next(null);
          }
      }
      /////// query now ///////////
      let queryUrl = `http://${ip}:${port}${target_restapi_prefix}/query/all`;
      this.http.post(queryUrl, {period: period}).subscribe(httpObserver);
    });
    return all;
  }  
}


