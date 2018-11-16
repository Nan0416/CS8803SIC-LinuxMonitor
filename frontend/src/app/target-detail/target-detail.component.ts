import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as d3 from "d3";
import { DataContainerService } from '../services/data-container.service';
import { TimeMap } from '../data-structures/TimeMap';
import { Overall,NetworkSection } from '../data-structures/Metrics';
import { Path, Axis } from '../data-structures/SVG';
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
  axis: Axis[] = [];
  // pathNames: string [] = ["loadavg_per_core", "cpu_overview", "memory", "network"];
  network_interface: string [] = [];
  pathData: any[] = [];

  timeScale;
  xAxis;
  period = period;
  svgPanel = {};
  chartPanel = {};
  
  isInit: boolean = true;

  svgWidth = 340;
  svgHeight = 200;
  padding = {t: 15, r: 30, b: 20, l: 30};
  chartWidth = this.svgWidth - this.padding.l - this.padding.r;
  chartHeight = this.svgHeight - this.padding.t - this.padding.b;
  
  
  // control
  request_period: number = 1000;
  updatePeriod(){
    this.dataContainer.updatePeriod(this.target_name, this.request_period);
  }
  useWS(){
    this.dataContainer.switchProtocolTo(this.target_name, "ws");
  }
  useHTTP(){
    this.dataContainer.switchProtocolTo(this.target_name, "http");
  }

  subscriptor: Subscription;
  constructor(
    private router:Router,
    private dataContainer: DataContainerService
  ) { }

  __pushData(metric: Overall){
    let formatted_data = {};
    let network: NetworkSection[] = metric.networkIO.network_io;
    formatted_data['time'] = metric.timestamp;
    formatted_data['loadavg_per_core'] = metric.loadavg.loadavg_per_core[0];
    formatted_data['loadavg'] = metric.loadavg.loadavg[0];
    for(let i = 0; i < network.length; i++){
      formatted_data[`${network[i].name}.in`] = network[i].in;
      formatted_data[`${network[i].name}.out`] = network[i].out;
    }
    formatted_data['cpu_overview'] = metric.CPU.overview.sys + metric.CPU.overview.user;
    formatted_data['cpu_overview_user'] = metric.CPU.overview.user;
    return formatted_data;
  }
  /**
   * When this component is load, try to find out if the datacontainer service already has data.
   */
  initPathData(){
    let data: TimeMap<Overall> = this.dataContainer.getStatistics(this.target_name);
    if(data){
      data.forEach((i: number, time: number, element: Overall)=>{
        this.pathData.push(this.__pushData(element));
      });
    }
  }
  createSVGPath(panel_name: string, name: string, color:string, yScale): Path{
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
        fun: fun,
      }
    }
    return null;
  }
  
  
  createSVGYAxis(panel_name: string, name: string, side:string, yScale): Axis{
    if(this.svgPanel[panel_name]){
      let yAxis;
      let l,t;
      if(side === "left"){
        yAxis = d3.axisLeft(yScale).ticks(4);
        t = this.padding.t;
        l = this.padding.l;
      }else{
        yAxis = d3.axisRight(yScale).ticks(4);
        t = this.padding.t;
        l = this.padding.l + this.chartWidth;
      }
      let yAxisSVG = this.svgPanel[panel_name].append('g').attr("class", "y axis")
        .attr("transform", `translate(${l}, ${t})`);
      return {
        panel_name: panel_name,
        name: name,
        yScale: yScale,
        yAxis: yAxis,
        yAxisSVG: yAxisSVG
      }
    }
    return null;
  }
  // only call once after the first data is load.
  __isInit: boolean = false;
  init(){
    let result: TimeMap<Overall> = this.dataContainer.getStatistics(this.target_name);
    if(!result){
      return;
    }
    if(!this.__isInit){
      this.__isInit = true;
      this.timeScale = d3.scaleTime().range([0, this.chartWidth]);
      this.xAxis = d3.axisBottom(this.timeScale).ticks(10);
      // this.xScale.domain([new Date(), new Date(new Date().getTime() - 60 * 1000)]);
      for(let i = 0; i < this.metrics.length; i++){
        this.svgPanel[this.metrics[i]] = d3.select(`#${this.metrics[i]}-svg`);
        this.chartPanel[this.metrics[i]] = this.svgPanel[this.metrics[i]].append('g');
        this.chartPanel[this.metrics[i]].attr('transform', `translate(${this.padding.l}, ${this.padding.t})`);
      }
      // create x
      for(let i = 0; i < this.metrics.length; i++){
        this.svgPanel[this.metrics[i]].append("g").attr("class", "x axis")
				  .attr("transform", `translate(${this.padding.l}, ${this.padding.t + this.chartHeight})`);
      }

      // load --- create Y axis and the paths based on it.
      let loadScale = d3.scaleLinear().domain([0,1]).range([this.chartHeight,0]);
      this.axis.push(this.createSVGYAxis("loadavg", "loadavg_per_core_axis", "right", loadScale));
      this.path.push(this.createSVGPath("loadavg", "loadavg_per_core","blue", loadScale));

      let loadScale2 = d3.scaleLinear().range([this.chartHeight,0]);
      this.axis.push(this.createSVGYAxis("loadavg", "loadavg_axis", "left", loadScale2));
      this.path.push(this.createSVGPath("loadavg", "loadavg","red", loadScale2));
      
      // CPU --- create Y axis and the path based on it.
      let CPUScale = d3.scaleLinear().domain([0,1]).range([this.chartHeight,0]);
      this.axis.push(this.createSVGYAxis("CPU", "cpu_axis", "right", CPUScale));
      this.path.push(this.createSVGPath("CPU", "cpu_overview","blue", CPUScale));
      this.path.push(this.createSVGPath("CPU", "cpu_overview_user","green", CPUScale));

      // network --- create Y axis and the paths based on it.
      let networkScale = d3.scaleLinear().range([this.chartHeight,0]);
      this.axis.push(this.createSVGYAxis("networkIO", "network_axis", "right", networkScale));
      let network_interface: NetworkSection[] = result.getLatest().networkIO.network_io;
      for(let i = 0; i < network_interface.length; i++){
        this.network_interface.push(network_interface[i].name);
        this.path.push(this.createSVGPath("networkIO", `${network_interface[i].name}.in`, "red", networkScale));
        this.path.push(this.createSVGPath("networkIO", `${network_interface[i].name}.out`, "green", networkScale));
      }      
      

    }
  }

  ngOnInit() {
    this.url2TargetName();   
    this.subscriptor = this.dataContainer.dataUpdate$.subscribe((name)=>{
      if(this.target_name === name){
        this.init();
        this.reDraw();
      }
    });
    this.initPathData();
  }
  ngOnDestroy(){
    this.subscriptor.unsubscribe();
  }
  url2TargetName(){
    this.target_name = decodeURIComponent(this.router.url.split('/')[2]);
  }

 
  /**
   * Organize data
   */
  pushData(result: TimeMap<Overall>){
    // push data, and also remove old data
    this.pathData.push(this.__pushData(result.getLatest()));
    let showDataAfterTime = result.getLatest().timestamp - this.period * 1000;
    while(this.pathData.length > 0){
      if(this.pathData[0].time < showDataAfterTime){
        this.pathData.shift();
      }else{
        break;
      }
    }
  }
  updateSVGPathYScaleDomain(pathname: string, domain){
    for(let i = 0; i < this.path.length; i++){
      if(this.axis[i].name === pathname){
        this.axis[i].yScale.domain(domain);
        break;
      }
    }
  }

  reDraw(){
    
    let result: TimeMap<Overall> = this.dataContainer.getStatistics(this.target_name);
    if(!result){
      return;
    }
    // update data
    this.pushData(result);
    // update X scale and axis
    let now = new Date(result.getLatest().timestamp);
    this.timeScale.domain([new Date(now.getTime() - this.period * 1000), now]);
    // update Y scale and axis
    this.updateSVGPathYScaleDomain("loadavg_axis", [0, d3.max(this.pathData, (d)=>{
      return d['loadavg'] + 0.3;
    })]);
    this.updateSVGPathYScaleDomain("network_axis", [0, d3.max(this.pathData, (d)=>{
      let max = 0;
      for(let i = 0; i < this.network_interface.length; i++){
        max = max < d[`${this.network_interface[i]}.in`]? d[`${this.network_interface[i]}.in`]:max;
        max = max < d[`${this.network_interface[i]}.out`]? d[`${this.network_interface[i]}.out`]:max;
      }
      return max;
    })]);

    

    // update
    for(let i = 0; i < this.metrics.length; i++){
      // draw x;
      this.svgPanel[this.metrics[i]].select(".x").transition().call(this.xAxis);    
    }
    for(let i = 0; i < this.axis.length; i++){
      // draw y axis;
      this.axis[i].yAxisSVG.transition().call(this.axis[i].yAxis);
    } 
    for(let i = 0; i < this.path.length; i++){
      // update path
      this.path[i].path.attr('d', this.path[i].fun);
    }
  }
}
