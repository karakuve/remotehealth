import { ActivityLogComponent } from './activity-log/activity-log.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivityRoutingModule } from './activity-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

import {MatCardModule} from '@angular/material/card';
import { ActivityListPageComponent } from './activity-list-page/activity-list-page.component';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

@NgModule({
  declarations: [    ActivityLogComponent, ActivityListPageComponent],
  imports: [
    CommonModule,
    ActivityRoutingModule,
    SharedModule,
    FormsModule,
    MatCardModule,
    MatGridListModule,
    MatTabsModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule,
  ]
})
export class ActivityLogModule { }
