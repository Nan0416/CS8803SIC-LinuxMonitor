import { Component, OnInit } from '@angular/core';
import { QueryService } from '../services/query.service'; 
import { QueryWSService } from '../services/query-ws.service';
import { CPU } from '../data-structures/CPU';
import * as d3 from "d3";
@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {

  
  constructor(
    private queryService: QueryService,
    private queryWSService: QueryWSService
  ) { }

  ngOnInit() {
    /*setInterval(()=>{
      this.queryService.queryCPU(Date.now().toString()).subscribe(data=>{
        console.log(data.sessionid);
        console.log(data.cpu.overview.sys + data.cpu.overview.user);
        d3.select('#rect')
          .attr('fill','red')
          .attr('width', `${(data.cpu.overview.sys + data.cpu.overview.user) * 1000}`)
          .attr('height', '200');
      }) 
    }, 100);*/
    this.queryWSService.initSocket();
    console.log("WS socket initialized");
    this.queryWSService.subscribe("CPU", 400);
    this.queryWSService.onErrReq().subscribe(console.log);
    this.queryWSService.onCPU().subscribe( (data:CPU) =>{
      console.log(data);
      d3.select('#rect')
        .attr('fill','red')
        .attr('width', `${(data.overview.sys + data.overview.user) * 1000}`)
        .attr('height', '200');
    });
  }


}
