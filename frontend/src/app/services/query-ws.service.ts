import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import {target_ws_prefix } from './config';
import { CPU } from '../data-structures/Metrics';

@Injectable({
  providedIn: 'root'
})
export class QueryWSService {
  private socket;
  // private path: string = target_ws_prefix;
  constructor(
   
  ) { 
   
  }
 
  public subscribe(ip: string, port: number, period: number) {
    let socket = socketIo(`http://${ip}:${port}`, {path: target_ws_prefix});
    socket.emit("subscribe", JSON.stringify({}));
    /*socket.emit("update", JSON.stringify({
      period: period
    }));*/
    
    return socket;
  }
  
}