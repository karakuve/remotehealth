import { ChatRoutingModule } from './chat-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatBoardListComponent } from './chat-board-list/chat-board-list.component';
import { ConnectToPatientsComponent } from './connect-to-patients/connect-to-patients.component';
import { SharedModule } from '../shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ChatSessionComponent } from './chat-session/chat-session.component';
import { PostQuestionsComponent } from './post-questions/post-questions.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManagePatientComponent } from './manage-patient/manage-patient.component';
@NgModule({
  declarations: [
    ChatBoardListComponent,
    ConnectToPatientsComponent,
    ChatSessionComponent,
    PostQuestionsComponent,
    ManagePatientComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatPaginatorModule,
    MatTableModule,
    ChatRoutingModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ChatModule { }
