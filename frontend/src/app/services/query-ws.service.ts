import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import {target_ws_server_addr } from './config';
import { CPU } from '../data-structures/CPU';
@Injectable({
  providedIn: 'root'
})
export class QueryWSService {
  private socket;
  constructor() { }

  public initSocket(): void {
    this.socket = socketIo(target_ws_server_addr);
  }

  public subscribe(item: String, frequency: Number = 300): void {
    this.socket.emit('subscribe', JSON.stringify({
      item: item,
      frequency: frequency
    }));
  }
  public onErrReq(): Observable<String> {
    return new Observable<String>(observer => {
      this.socket.on('errReq', (data: String) => observer.next(data));
    });
  }
  public onCPU(): Observable<CPU> {
    return new Observable<CPU>(observer => {
      this.socket.on('CPU', (data) => {
        if(data.success){
          observer.next(data.value);
        }
      });
    });
  }

  /*public onEvent(event: Event): Observable<any> {
      return new Observable<Event>(observer => {
          this.socket.on(event, () => observer.next());
    );
      }*/
}