import { Component, OnInit, OnDestroy } from '@angular/core';
import { QueryService } from '../services/query.service'; 
import { QueryWSService } from '../services/query-ws.service';
import { CPU } from '../data-structures/CPU';
import { Target } from '../data-structures/Target';
import { TargetOperationService } from '../services/target-operation.service';
import { Subscription } from 'rxjs';
import * as d3 from "d3";
@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit, OnDestroy {

  targets: Target[] = [];
  constructor(
    private queryService: QueryService,
    private queryWSService: QueryWSService,
    private targetOperator: TargetOperationService
  ) { }

  // UI
  barWidth: number = 160;
  convertToWidth(target: Target, metric: string): number{
    return 100;
  }

  private subscriptor: Subscription;
    

  ngOnInit() {
    this.subscriptor = this.targetOperator.targetModification$.subscribe(()=>{
      this.listTargets();
    });
    this.listTargets();
    
    
    
    /*setInterval(()=>{
      this.queryService.queryCPU(Date.now().toString()).subscribe(data=>{
        console.log(data.sessionid);
        console.log(data.cpu.overview.sys + data.cpu.overview.user);
        d3.select('#rect')
          .attr('fill','red')
          .attr('width', `${(data.cpu.overview.sys + data.cpu.overview.user) * 1000}`)
          .attr('height', '200');
      }) 
    }, 100);
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
    });*/
  }
  ngOnDestroy(){
    this.subscriptor.unsubscribe();
  }

  listTargets(){
    let tmp_targets: Target[] = [];
    this.targetOperator.targets.forEach((target: Target)=>{
      tmp_targets.push(target);
    });
    this.targets = tmp_targets;
  }

}
