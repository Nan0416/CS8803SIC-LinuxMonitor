import { Component , OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import { UserOperationService } from './services/user-operation.service';
import { TargetOperationService } from './services/target-operation.service';
import { DataContainerService } from './services/data-container.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  display_hidden_block: string = "none";
  display_menu: string = "block";
  display_close: string = "none";
  constructor(
    private router: Router,
    private userOperator: UserOperationService,
    private targetOperator: TargetOperationService,
    private dataContainer: DataContainerService
  ){ }
  username: string = null;
  ngOnInit(){
    
    this.router.events.subscribe((evt)=>{
      if(!(evt instanceof NavigationEnd)){
        return;
      }
      this.display_hidden_block  = "none";
      this.display_menu  = "block";
      this.display_close  = "none";
    });
    this.userOperator.userMount$.subscribe(data=>{
      this.username = data.username;
      this.targetOperator.ws_open();
      this.targetOperator.ws_subscribe();
      this.targetOperator.queryTargets();
      this.dataContainer.init();
    });
    this.userOperator.userUnMount$.subscribe(data=>{
      this.username = null;
      this.dataContainer.clear();
      this.targetOperator.ws_close();
    });
    this.userOperator.queryUserWithSession();
    this.targetOperator.queryTargets();
  }



  sidenavToggle(){
    if(this.display_hidden_block === 'none'){
      this.display_hidden_block = 'flex';
      this.display_close = "block";
      this.display_menu = "none";
    }else if(this.display_hidden_block === 'flex'){
      this.display_hidden_block = 'none';
      this.display_close = "none";
      this.display_menu = "block";
    }
  }
  logout(){
    this.userOperator.logout().subscribe(data=>{
      if(data.success){
        this.router.navigate(["login"]);
        this.targetOperator.ws_close();
        // clear
      }else{
        //show err
        alert(JSON.stringify(data.reasons));
      }
    });
  }
}
