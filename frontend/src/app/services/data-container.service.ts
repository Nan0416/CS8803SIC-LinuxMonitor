import { Injectable } from '@angular/core';
import { QueryService } from './query.service';
import {CPU} from '../data-structures/CPU';
@Injectable({
  providedIn: 'root'
})
export class DataContainerService {
  
  cpuData: Map<number, CPU>;
  
  constructor(
    private queryService: QueryService
  ) { 
    this.cpuData = new Map();
  }


}
