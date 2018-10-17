import { Component, OnInit } from '@angular/core';
import { QueryService } from '../services/query.service'; 
import * as d3 from "d3";
@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {

  
  constructor(
    private queryService: QueryService
  ) { }

  ngOnInit() {
    setInterval(()=>{
      this.queryService.queryCPU(Date.now().toString()).subscribe(data=>{
        console.log(data.sessionid);
        console.log(data.cpu.overview.sys + data.cpu.overview.user);
        d3.select('#rect')
          .attr('fill','red')
          .attr('width', `${(data.cpu.overview.sys + data.cpu.overview.user) * 1000}`)
          .attr('height', '200');
      }) 
    }, 100);
  }


}
