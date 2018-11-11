import { Component, OnInit, OnDestroy } from '@angular/core';
import { TargetOperationService } from '../services/target-operation.service';
import { Target } from '../data-structures/Target';
import {Subscription} from 'rxjs';
import { DataContainerService } from '../services/data-container.service';
import {Overall} from '../data-structures/Metrics';
@Component({
  selector: 'app-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.scss']
})
export class TargetComponent implements OnInit , OnDestroy{

  constructor(
    private targetOperator: TargetOperationService,
  ) { }

  name_input: string = null; 
  protocol_input: string = "http";
  ip_input: string = null;
  port_input: number = null;
  error_msg: string = null;

  targets: Target[] = [];
  
  subscriptor_target: Subscription;
  ngOnInit() {
    this.subscriptor_target = this.targetOperator.targetModification$.subscribe(()=>{
      this.listTargets();
    });
    this.listTargets();
  }
  ngOnDestroy(){
    this.subscriptor_target.unsubscribe();
  }
  

  listTargets(){
    let tmp_targets: Target[] = [];
    this.targetOperator.targets.forEach((target: Target)=>{
      tmp_targets.push(target);
    });
    
    this.targets = tmp_targets;
    console.log(this.targets.length);
  }
  addTarget(){
    let port = 9000;
    if(this.port_input !== null){
      port = this.port_input;
    }
    if(this.name_input === null){
      this.error_msg = "Invalid name";
      return;
    }
    if(this.ip_input === null){
      this.error_msg = "Invalid IP/Domain";
      return;
    }
    this.targetOperator.registerTarget(this.name_input, this.protocol_input, this.ip_input, port).subscribe(data=>{
      if(!data.success){
        this.error_msg = data.reasons[0];
      }else{
        this.name_input  = null; 
        this.protocol_input  = "http";
        this.ip_input  = null;
        this.port_input  = null;
        this.error_msg = null;
      }
    });
  }
  deleteTarget(name: string){
    this.targetOperator.deleteTarget(name).subscribe((data)=>{
      if(!data.success){
        this.error_msg = data.reasons[0];
      }
    });
  }
  

}
