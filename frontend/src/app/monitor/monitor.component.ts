import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataContainerService } from '../services/data-container.service'; 
import { Overall } from '../data-structures/Metrics';
import { Target } from '../data-structures/Target';
import { TargetOperationService } from '../services/target-operation.service';
import { Subscription } from 'rxjs';
import { Router} from '@angular/router';
@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit, OnDestroy {

  targets: Target[] = [];
  dynamic_styles: Map<string, PanelStyle>;
  constructor(
    private targetOperator: TargetOperationService,
    private dataContainer: DataContainerService,
    private router: Router
  ) { 
    this.dynamic_styles = new Map();
  }

  // UI
  barWidth: number = 160;
  convertToWidth(target_name: string, metric: string): number{
    let style: PanelStyle = this.dynamic_styles.get(target_name);
    if(metric === "load"){
      let temp = Math.round(style.load * this.barWidth);
      return temp > this.barWidth?this.barWidth : temp;
    }else if(metric === "CPU"){
      let temp =  Math.round(style.CPU * this.barWidth);
      return temp > this.barWidth?this.barWidth : temp;
    }else if(metric === "memory"){
      let temp =  Math.round(style.memory * this.barWidth);
      return temp > this.barWidth?this.barWidth : temp;
    } 
    return 0;
  }

  private subscriptor_target: Subscription;
  private subscriptor_statistics: Subscription;

  ngOnInit() {
    this.subscriptor_target = this.targetOperator.targetModification$.subscribe(()=>{
      this.listTargets();
    });
    
    this.subscriptor_statistics = this.dataContainer.dataUpdate$.subscribe((target_name:string)=>{
      this.updateTargetPanel(target_name);
    });
    this.listTargets();
    for(let i = 0; i < this.targets.length; i ++){
      this.updateTargetPanel(this.targets[i].name);
    }
  }
  ngOnDestroy(){
    this.subscriptor_target.unsubscribe();
    this.subscriptor_statistics.unsubscribe();
  }

  listTargets(){
    let tmp_targets: Target[] = [];
    this.targetOperator.targets.forEach((target: Target)=>{
      tmp_targets.push(target);
      if(!this.dynamic_styles.has(target.name)){
        let style = new PanelStyle();
        style.CPU = 0;
        style.memory = 0;
        style.load = 0;
        this.dynamic_styles.set(target.name, style);
      }
    });
    this.targets = tmp_targets;
  }
  
  updateTargetPanel(target_name: string){
    // get the latest stat from data-container
    let stat: Overall = this.dataContainer.getLatestStatistics(target_name);
    if(!stat){
      return;
    }
    if(this.dynamic_styles.has(target_name)){
      let style: PanelStyle = this.dynamic_styles.get(target_name);
      style.CPU = stat.CPU.overview.user + stat.CPU.overview.sys;
      style.memory = 1 - (stat.memory.MemFree / stat.memory.MemTotal);
      style.load = stat.loadavg.loadavg_per_core[0];
    }
  }
  goToTarget(target_name:string){
    let t: Target = this.targetOperator.targets.get(target_name);
    if(t && t.status === 1){
      this.router.navigate([`/monitor/${target_name}`]);
    }else{
      
    }

  }

}
class PanelStyle{
  CPU: number;
  load: number;
  memory: number;
}
