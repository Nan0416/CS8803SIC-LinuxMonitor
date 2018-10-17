import { Component , OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  display_hidden_block: string = "none";
  display_display_menu: string = "block";
  display_close: string = "none";
  constructor(
    private router: Router,
  ){ }
  ngOnInit(){
    
    this.router.events.subscribe((evt)=>{
      if(!(evt instanceof NavigationEnd)){
        return;
      }
      this.display_hidden_block  = "none";
      this.display_display_menu  = "block";
      this.display_close  = "none";
    });
  }
  sidenavToggle(){
    if(this.display_hidden_block === 'none'){
      this.display_hidden_block = 'flex';
      //this.display_close = "block";
      //this.display_display_menu = "none";
    }else if(this.display_hidden_block === 'flex'){
      this.display_hidden_block = 'none';
      //this.display_close = "none";
      //this.display_display_menu = "block";
    }
  }
}
