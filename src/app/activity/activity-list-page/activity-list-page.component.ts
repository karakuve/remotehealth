import { ConnectService } from './../../connect/connect.service';
import { ActivityFunctionService } from './../activity-function.service';
import { Component, HostListener, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { Subscription } from 'rxjs';
import { ActivitydbService } from '../activitydb.service';
import { activity } from './../activity.model'
import { sensordata } from './../activity.model';

import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

Chart.register(...registerables);

Chart.register(annotationPlugin);

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
  apiLoaded: Observable<boolean>;

  constructor(public xtvtdb: ActivitydbService, public service: ActivityFunctionService, public connect: ConnectService, public httpClient: HttpClient) {
    this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyC-_FuLANbZGzSxxh-uOsi8hBKVhNVKaco', 'callback')
      .pipe(
        map(() => true),
        catchError(() => of(false)),
      );
  }

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
  bpLower: number = 0;
  bpUpper: number = 0;
  lng: number = 0;
  lat: number = 0;
  posture: number[];

  maxVal: number;
  minVal: number;
  stdVal: number;
  medVal: number;

  min_thresh: any;
  max_thresh: any;

  center: google.maps.LatLngLiteral;
  zoom: 18;
  markerPositions: google.maps.LatLngLiteral;
  markerOptions: google.maps.MarkerOptions = { draggable: false };

  showLogDetails(value: any) {
    try {
      this.isDisplayed = true
      this.data = value;

      this.title = this.data.title;
      this.notes = this.data.notes;

      this.activityDate = this.data.date;
      this.timeStart = this.data.time.starttime;
      this.timeEnd = this.data.time.endtime;
      this.timeInterval = this.service.getTimeInterval(this.timeEnd - this.timeStart);
      this.sensData = this.data.sensordata;
      this.innitData();



    } catch (error) {
      console.log(error);
    }
  }


  innitData() {

    const temp = JSON.parse(JSON.stringify(this.sensData.temperature));
    const heartR = JSON.parse(JSON.stringify(this.sensData.heartrate));
    const oxy = JSON.parse(JSON.stringify(this.sensData.oximeter));
    const bpupper = JSON.parse(JSON.stringify(this.sensData.bloodpressure?.upper));
    const bplower = JSON.parse(JSON.stringify(this.sensData.bloodpressure?.lower));
    const geoposition = JSON.parse(JSON.stringify(this.sensData.position));
    const posture = JSON.parse(JSON.stringify(this.sensData.posture));

    this.temperature = temp;
    this.heartRate = heartR;
    this.oxygen = oxy;
    this.bpLower = bplower;
    this.bpUpper = bpupper;
    this.lat = geoposition.latitude;
    this.lng = geoposition.longitude;
    this.posture = posture;

    if (this.chart) {
      this.chart.destroy();
    }

    console.log("current tab : " + this.selectTab);
    if (this.selectTab == 0) {
      this.chartAll();
    } else {
      this.dispChart(this.selectTab);
    }


    try {
      this.center = { lat: this.lat, lng: this.lng };
      this.markerPositions = { lat: this.lat, lng: this.lng };
    } catch (error) {
      console.log(error);
      console.log("error in try map");
    }

  }

  dispChart(index: number) {
    if (this.chart) this.chart.destroy();

    if (index == 1) {

      this.min_thresh = 37.5;
      this.max_thresh = 36;
      this.maxVal = this.connect.max(this.temperature);
      this.minVal = this.connect.min(this.temperature);
      this.stdVal = this.connect.std(this.temperature);
      this.medVal = this.connect.median(this.temperature);

      try {
        this.chartDisplay(this.temperature, "temperature");
      } catch (error) {
        console.log(error);
      }

    } else if (index == 2) {
      this.min_thresh = 40;
      this.max_thresh = 255;

      this.maxVal = this.connect.max(this.heartRate);
      this.minVal = this.connect.min(this.heartRate);
      this.stdVal = this.connect.std(this.heartRate);
      this.medVal = this.connect.median(this.heartRate);

      try {
        this.chartDisplay(this.heartRate, "heartRate");
      } catch (error) {
        console.log(error);
      }

    } else if (index == 3) {

      this.maxVal = this.connect.max(this.oxygen);
      this.minVal = this.connect.min(this.oxygen);
      this.stdVal = this.connect.std(this.oxygen);
      this.medVal = this.connect.median(this.oxygen);

      this.min_thresh = 90;
      this.max_thresh = 100;
      try {
        this.chartDisplay(this.oxygen, "oxy");
      } catch (error) {

      }
    } else if (index == 6) {
      try {
        this.chartPosture();
      } catch (error) {

      }
    } else if (index == 0) {
      try {
        this.chartAll();
      } catch (error) {

      }
    }
  }


  tabChange($event: any) {
    this.selectTab = $event.index;

    this.dispChart($event.index);
  }

  public chart: Chart;
  public chartTemp: Chart;
  //TODO : sync data with db
  //problem to take direct from activity type value

  chartDisplay(dataset: any[], id: string) {

    const canvas = <HTMLCanvasElement>document.getElementById(id);

    const hrLimit: any = {
      annotations: {
        line1: {
          type: 'line',
          yMin: this.min_thresh,
          yMax: this.min_thresh,
          borderColor: 'rgb(95, 242, 90)',
          borderWidth: 3,
          drawTime: "afterDatasetsDraw",
        },
        line2: {
          type: 'line',
          yMin: this.max_thresh,
          yMax: this.max_thresh,
          borderColor: 'rgb(95, 242, 90)',
          borderWidth: 3,
          drawTime: "afterDatasetsDraw"
        }
      }
    }

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.timeInterval,
        datasets: [{
          backgroundColor: 'rgb(95, 242, 90)',
          borderColor: 'rgb(255, 255, 255)',
          data: dataset,
          tension: 0.3,

        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              color: "white",
            },
            suggestedMin: 90,
            suggestedMax: 40,
            beginAtZero: false
          },
          x: {
            display: true,
            ticks: {
              color: "white",
              autoSkip: true,
              maxTicksLimit: 21
            },
            beginAtZero: true,

            grid: {
              color: "white"
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          decimation: {
            enabled: true,
            algorithm: 'lttb', samples: 1000
          },
          annotation: hrLimit,

        },
        elements: {
          point: {
            // radius: this.adjustRadiusBasedOnData,
            // backgroundColor : this.adjustBackgroundColorHR,
            radius: 0,
          }
        },
      },
    });
  }

  chartAll() {
    const canvas = <HTMLCanvasElement>document.getElementById("all");


    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.timeInterval,
        datasets: [{
          label: "Temperature",
          backgroundColor: 'rgb(95, 242, 90)',
          borderColor: 'rgb(95, 242, 90)',
          data: this.temperature,
          tension: 0.3,
        },
        {
          label: "Oxygen",
          backgroundColor: 'rgb(255,165,0)',
          borderColor: 'rgb(255,165,0)',
          data: this.oxygen,
          tension: 0.3,
        },
        {
          label: "Heartrate",
          backgroundColor: 'rgb(100,149,237)',
          borderColor: 'rgb(100,149,237)',
          data: this.heartRate,
          tension: 0.3,
        }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              color: "white",
            },
            suggestedMin: 90,
            suggestedMax: 40,
            beginAtZero: false
          },
          x: {
            display: true,
            ticks: {
              color: "white",
              autoSkip: true,
              maxTicksLimit: 21
            },
            beginAtZero: true,

            grid: {
              color: "white"
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: "white",
              font: {
                size: 12
              }
            }
          },
          decimation: {
            enabled: true,
            algorithm: 'lttb', samples: 1000
          },
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

  chartPosture() {

    const canvas = <HTMLCanvasElement>document.getElementById("pos");

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.timeInterval,
        datasets: [{
          backgroundColor: 'rgb(95, 242, 90)',
          borderColor: 'rgb(255, 255, 255)',
          data: this.posture,
          tension: 0.3,

        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              color: "white",
            },
            suggestedMin: 5,
            suggestedMax: 1,
            beginAtZero: false
          },
          x: {
            display: true,
            ticks: {
              color: "white",
              autoSkip: true,
              maxTicksLimit: 21
            },
            beginAtZero: true,

            grid: {
              color: "white"
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          decimation: {
            enabled: true,
            algorithm: 'lttb', samples: 1000
          },

        },
        elements: {
          point: {
            radius: 0,
          }
        },
      },
    });
  }


}

