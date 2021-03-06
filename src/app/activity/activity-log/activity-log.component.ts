import { ActivityFunctionService } from './../activity-function.service';
import { activity } from './../activity.model';
import { Component, Input, OnInit } from '@angular/core';
import { ActivitydbService } from '../activitydb.service';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})
export class ActivityLogComponent implements OnInit {
  
  @Input() board: any;
  constructor( public xtvtdb : ActivitydbService, public service : ActivityFunctionService) { }

  activityDate : any;
  starttime : any;
  endtime : any;
  hourMin : any;

  ngOnInit(): void {
    //this.activityDate = Date.parse(this.service.toDate(this.board.date.toString()));
    this.activityDate = this.board.date;
    this.hourMin = this.getElapsed();
  }

  status : boolean;

  toggle(){
    this.status = !this.status;
  }

  // getElapsed(){
  //   const end = Date.parse(this.service.toDateTime(this.board.time.endtime.toString()));
  //   const start = Date.parse(this.service.toDateTime(this.board.time.starttime.toString()));
  //   const elapsed = (end - start)/(1000*3600)*60;
  //   const hour = Math.floor(elapsed / 60);
  //   const minutes = elapsed%60;
  //   const time : string[] = [hour.toString(),minutes.toString()];
  //   return time
  // }

  getElapsed(){
    this.starttime = this.board.time.starttime;
    this.endtime = this.board.time.endtime;
    const elapsed = (this.endtime - this.starttime)/1000;
    const hour = Math.floor(elapsed / (60*60));
    const minutes = Math.floor((elapsed%(60*60))/60);
    const seconds = Math.floor((elapsed%(60*60))%60);
    const time : string[] = [hour.toString(),minutes.toString(),seconds.toString()];
    return time
  }


}
