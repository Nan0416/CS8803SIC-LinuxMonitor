import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-target-detail',
  templateUrl: './target-detail.component.html',
  styleUrls: ['./target-detail.component.scss']
})
export class TargetDetailComponent implements OnInit {

  target_name: string;
  constructor(
    private router:Router
  ) { }

  ngOnInit() {

    this.url2TargetName();
    console.log(this.target_name);
  }

  url2TargetName(){
    this.target_name = decodeURIComponent(this.router.url.split('/')[2]);
  }
}
