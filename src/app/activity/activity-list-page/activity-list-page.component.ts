
import { AfterViewInit, Component, HostListener, OnInit, Input } from '@angular/core';

import { Subscription } from 'rxjs';
import { ActivitydbService } from '../activitydb.service';
import { activity } from './../activity.model'

@Component({
  selector: 'app-activity-list-page',
  templateUrl: './activity-list-page.component.html',
  styleUrls: ['./activity-list-page.component.scss']
})

export class ActivityListPageComponent implements OnInit  {

  //real one
  activityBoard : activity[];
  sub: Subscription;

  constructor( public xtvtdb : ActivitydbService) {}
  
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

  @Input() data: any  ;
  title:string;
  isDisplayed : boolean = false;
  activityDate : any;
  notes : string;
  timeStart: any;
  timeEnd : any;


  showLogDetails(value: any){
    try {
      this.isDisplayed= true
      this.data = value;
      this.title = this.data.title;
      this.activityDate = Date.parse(this.toDate(this.data.date.toString()));
      this.notes = this.data.notes;
      this.timeStart = Date.parse(this.toDateTime(this.data.time.starttime.toString()));
      this.timeEnd = Date.parse(this.toDateTime(this.data.time.endtime.toString()));
    } catch (error) {
      
    }
  }

  toDate(input: string){
    const year = input.slice(0,4);
    const month = input.slice(4,6);
    const day = input.slice(6,8);
    const date = month + " " + day + " " + year;
    
    return date
  }

  toDateTime(input : string){
    const year = input.slice(4,8);
    const month = input.slice(2,4);
    const day = input.slice(0,2);
    const hour = input.slice(9,11);
    const minute = input.slice(11,13);
    const longDate = month + " " + day + " " + year + " " + hour + ":"+ minute;
    console.log(longDate);
    return longDate;
  }

}



