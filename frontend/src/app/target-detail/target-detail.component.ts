import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from "d3";
import { DataContainerService } from '../services/data-container.service';
import { TimeMap } from '../data-structures/TimeMap';
import { Overall } from '../data-structures/Metrics';
import { Path } from '../data-structures/Path';
import { Subscription } from 'rxjs';
import { period} from '../services/config';
@Component({
  selector: 'app-target-detail',
  templateUrl: './target-detail.component.html',
  styleUrls: ['./target-detail.component.scss']
})
export class TargetDetailComponent implements OnInit , OnDestroy{

  target_name: string;
  metrics : string []= ["loadavg", "CPU", "memory", "diskIO", "networkIO"];
  path: Path[] = [];
  // pathNames: string [] = ["loadavg_per_core", "cpu_overview", "memory", "network"];
  pathData: any[] = [];

  timeScale;
  xAxis;
  period = period;
  svgPanel = {};
  chartPanel = {};
  
  isInit: boolean = true;

  svgWidth = 340;
  svgHeight = 200;
  padding = {t: 15, r: 30, b: 20, l: 15};
  chartWidth = this.svgWidth - this.padding.l - this.padding.r;
  chartHeight = this.svgHeight - this.padding.t - this.padding.b;
  
  

  subscriptor: Subscription;
  constructor(
    private router:Router,
    private dataContainer: DataContainerService
  ) { }
  
  createSVGPath(panel_name: string, name: string, color:string, yScale: Function): Path{
    if(this.chartPanel[panel_name]){
      let path = this.chartPanel[panel_name].append('path')
        .datum(this.pathData)
        .attr('class', 'line-plot')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', '2px');
      let fun: Function = d3.line()
        .x((d)=>{ return this.timeScale(new Date(d.time)); })
        .y((d)=>{ return yScale(d[name]);})
        .curve(d3.curveBasis);

      return {
        panel_name: panel_name,
        name: name,
        path: path,
        yScale: yScale,
        fun: fun,
        yAxis: d3.axisRight(yScale).ticks(4),
        yAxisSVG: null
      }
    }
    return null;
  }
  updateSVGPathYScaleDomain(name: string, domain){
    for(let i = 0; i < this.path.length; i++){
      if(this.path[i].name === name){
        this.path[i].yScale.domain(domain);
        break;
      }
    }
  }
  init(){
    this.timeScale = d3.scaleTime().range([0, this.chartWidth]);
    this.xAxis = d3.axisBottom(this.timeScale).ticks(10);
    // this.xScale.domain([new Date(), new Date(new Date().getTime() - 60 * 1000)]);
    for(let i = 0; i < this.metrics.length; i++){
      this.svgPanel[this.metrics[i]] = d3.select(`#${this.metrics[i]}-svg`);
      this.chartPanel[this.metrics[i]] = this.svgPanel[this.metrics[i]].append('g');
      this.chartPanel[this.metrics[i]].attr('transform', `translate(${this.padding.l}, ${this.padding.t})`);
    }
    this.path.push(this.createSVGPath("loadavg", "loadavg_per_core","blue", d3.scaleLinear().domain([0,1]).range([this.chartHeight,0])));
    this.path.push(this.createSVGPath("CPU", "cpu_overview", "red", d3.scaleLinear().domain([0,1]).range([this.chartHeight,0])));
    this.path.push(this.createSVGPath("memory", "memory", "green", d3.scaleLinear().range([this.chartHeight,0])));
    this.path.push(this.createSVGPath("networkIO", "network", "green", d3.scaleLinear().range([this.chartHeight,0])));
  }

  ngOnInit() {

    this.url2TargetName();   
    this.subscriptor = this.dataContainer.dataUpdate$.subscribe((name)=>{
      if(this.target_name === name){
        this.reDraw();
      }
    });
    this.init();
    this.reDraw();
  }
  ngOnDestroy(){
    this.subscriptor.unsubscribe();
  }
  url2TargetName(){
    this.target_name = decodeURIComponent(this.router.url.split('/')[2]);
  }
  /**
   * 
   * @param result 
   * Organize data
   */
  pushData(result){
    // push data, and also remove old data
    this.pathData.push({
      time: result.getLatest().timestamp,
      loadavg_per_core: result.getLatest().loadavg.loadavg_per_core[0],
      cpu_overview: result.getLatest().CPU.overview.user + result.getLatest().CPU.overview.sys,
      memory: result.getLatest().memory.MemTotal - result.getLatest().memory.MemFree ,
      network: result.getLatest().networkIO.network_io[0].in
    });
    let showDataAfterTime = result.getLatest().timestamp - this.period * 1000;
    while(this.pathData.length > 0){
      if(this.pathData[0].time < showDataAfterTime){
        this.pathData.shift();
      }else{
        break;
      }
    }
  }
  reDraw(){
    
    let result = this.dataContainer.getStatistics(this.target_name);
    if(!result){
      return;
    }
    // update data
    this.pushData(result);
    // update axis
    let now = new Date(result.getLatest().timestamp);
    this.timeScale.domain([new Date(now.getTime() - this.period * 1000), now]);
    // update Y scale
    this.updateSVGPathYScaleDomain("memory", [0,result.getLatest().memory.MemTotal]);
    this.updateSVGPathYScaleDomain("network", d3.extent(this.pathData, (d)=>{
      return d.network;
    }));



    if(this.isInit){
      // draw Axis;
      for(let i = 0; i < this.metrics.length; i++){
        // draw x
        this.svgPanel[this.metrics[i]].append("g").attr("class", "x axis")
				  .attr("transform", `translate(${this.padding.l}, ${this.padding.t + this.chartHeight})`)
				  .call(this.xAxis);
      }
      for(let i = 0; i < this.path.length; i++){
        // draw static y axis
        this.path[i].yAxisSVG = this.svgPanel[this.path[i].panel_name].append("g").attr("class", "y axis")
				  .attr("transform", `translate(${this.padding.l + this.chartWidth}, ${this.padding.t})`)
				  .call(this.path[i].yAxis);
      }
      
      this.isInit = false;





    }else{
      // update
      for(let i = 0; i < this.metrics.length; i++){
        // draw x;
        this.svgPanel[this.metrics[i]].select(".x").transition().call(this.xAxis);
        
      }
      for(let i = 0; i < this.path.length; i++){
        // update y axis;
        this.path[i].yAxisSVG.transition().call(this.path[i].yAxis);
        
      }
      //this.path['loadavg-per-core'].attr('d', lineInterpolate);
      for(let i = 0; i < this.path.length; i++){
        // draw path
        this.path[i].path.attr('d', this.path[i].fun);
      }
                
      
    }
    
    
    
  }
}
