import { ActivityFunctionService } from './../activity-function.service';
import { AfterViewInit, Component, HostListener, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { Subscription } from 'rxjs';
import { ActivitydbService } from '../activitydb.service';
import { activity } from './../activity.model'
import { sensordata } from './../activity.model';

import { Chart, registerables } from 'chart.js';
import * as math from 'mathjs';

Chart.register(...registerables);


@Component({
  selector: 'app-activity-list-page',
  templateUrl: './activity-list-page.component.html',
  styleUrls: ['./activity-list-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ActivityListPageComponent implements OnInit {

  selectTab = 0;
  activityBoard: activity[];
  sub: Subscription;

  constructor(public xtvtdb: ActivitydbService, public service: ActivityFunctionService) { }

  innerHeight: any;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.innerHeight = window.innerHeight;

    this.sub = this.xtvtdb.getAcitivtyLog()
      .subscribe(log => (this.activityBoard = log));

    this.isDisplayed = false


  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
  isDisplayed: boolean = false;

  @Input() data: any;

  title: string;
  notes: string;

  activityDate: any;
  timeStart: any;
  timeEnd: any;

  timeInterval: string[];
  sensData: sensordata;
  temperature: number[];
  heartRate: number[];
  oxygen: number[];

  maxVal: number;
  minVal: number;
  stdVal: number;
  medVal: number;

  showLogDetails(value: any) {
    try {
      this.isDisplayed = true
      this.data = value;

      this.title = this.data.title;
      this.notes = this.data.notes;

      // this.activityDate = Date.parse(this.service.toDate(this.data.date.toString()));
      this.activityDate = this.data.date;
      this.timeStart = this.data.time.starttime;
      this.timeEnd = this.data.time.endtime;
      // this.timeInterval = JSON.parse(JSON.stringify(this.timeEnd-this.timeStart));
      this.timeInterval = this.service.getTimeInterval(this.timeEnd - this.timeStart);
      this.sensData = this.data.sensordata;
      this.innitData();

      // this.testChart();


    } catch (error) {
      console.log(error);
    }
  }

  
  innitData() {
    let tempLength = this.sensData.temperature!.length;
    let heartLength = this.sensData.heartrate!.length;
    let oxyLength = this.sensData.oximeter!.length;
    
    const temp = JSON.parse(JSON.stringify(this.sensData.temperature));
    const heartR = JSON.parse(JSON.stringify(this.sensData.heartrate));
    const oxy = JSON.parse(JSON.stringify(this.sensData.oximeter));
    
    //this.temperature = new Array(tempLength)
    this.temperature = temp;
    this.heartRate = heartR;
    this.oxygen = oxy;
  }

  dispTable($event: any) {
    if (this.chart) this.chart.destroy();
    console.log("event index" + $event.index);

    if ($event.index ==0) {

      try {
        this.chartDisplay(this.temperature, "temperature");
      } catch (error) {
        console.log(error);
      }

      this.maxVal = this.maxTemp;
      this.minVal = this.minTemp;
      this.stdVal = this.stdTemp;
      this.medVal = this.medianTemp;

    }else if($event.index ==1){

      try {
        this.chartDisplay(this.heartRate, "heartRate");
      } catch (error) {
        console.log(error);
      }

      this.maxVal = this.maxHR;
      this.minVal = this.minHR;
      this.stdVal = this.stdHR;
      this.medVal = this.medianHR;

    }else if($event.index == 2){

      try {
        this.chartDisplay(this.oxygen, "oxy");
      } catch (error) {
        
      }
    }

  }

  public chart: Chart;
  public chartTemp : Chart;
  //TODO : sync data with db
  //problem to take direct from activity type value

  chartDisplay(dataset : any[], id : string) {

    const canvas = <HTMLCanvasElement>document.getElementById(id);

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.timeInterval,
        datasets: [{
          backgroundColor: 'rgb(95, 242, 90)',
          borderColor: 'rgb(255, 255, 255)',
          data: dataset,
          tension:0.3,
        }]
      },
      options: {
        responsive: true,
        //maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              color: "white",
              // font: {
              //   size: 18, // 'size' now within object 'font {}'
              // }  

            },
            suggestedMin:90,
            beginAtZero: false
          },
          x: {
            display: true,
            ticks: {
              color: "white",
              // font: {
              //   size: 14 // 'size' now within object 'font {}'
              // }
              autoSkip: true,
              maxTicksLimit: 21
            },
            beginAtZero: true,

            grid: {
              color: "white"
            }
          }
        },
        plugins: {  // 'legend' now within object 'plugins {}'
          legend: {
            labels: {
              color: "white",  // not 'fontColor:' anymore
              // fontSize: 18  // not 'fontSize:' anymore
              font: {
                size: 12 // 'size' now within object 'font {}'
              }
            }
          },
          decimation: {
            enabled: true,
            algorithm: 'lttb', samples: 1000
          }
        },
        elements: {
          point: {
            // radius: this.adjustRadiusBasedOnDataHR,
            // backgroundColor : this.adjustBackgroundColorHR,
            radius: 0,
          }
        },
      },
    });

  }


  adjustRadiusBasedOnData(ctx: any) {
    const v = ctx.parsed.y;
    return v > 37 ? 5
      : v < 36 ? 5
        : 5;
  }

  adjustBackgroundColor(ctx: any) {
    const v = ctx.parsed.y;
    return v > 37 ? 'rgb(255, 99, 132)'
      : v < 36 ? 'rgb(255, 99, 132)'
        : 'rgb(95, 242, 90)'
  }



  get maxHR() {
    return Math.max(...this.heartRate);
  }

  get minHR() {
    return Math.min(...this.heartRate);
  }

  get medianHR() {
    return math.median(this.heartRate);
  }

  get stdHR() {
    return math.std(this.heartRate);
  }

  get maxTemp() {
    return Math.max(...this.temperature);
  }

  get minTemp() {
    return Math.min(...this.temperature);
  }

  get medianTemp() {
    return math.median(this.temperature);
  }

  get stdTemp() {
    return math.std(this.temperature);
  }



}

