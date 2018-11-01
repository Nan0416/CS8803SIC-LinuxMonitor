import { Component, OnInit } from '@angular/core';
import {UserOperationService} from '../services/user-operation.service';
import {DataContainerService} from '../services/data-container.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent implements OnInit {

  constructor(
    private userOperator: UserOperationService,
    private router: Router,
    private datacontainer: DataContainerService,
  ) { }

  ngOnInit() {
  }
  logout(){
    this.userOperator.logout().subscribe(data=>{
      if(data.success){
        this.router.navigate(["login"]);
        // clear
      }else{
        //show err
        alert(JSON.stringify(data.reasons));
      }
    });
  }
}
