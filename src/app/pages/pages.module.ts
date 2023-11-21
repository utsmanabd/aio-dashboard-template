import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule, NgbDatepickerModule, NgbTooltipModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { LightboxModule } from 'ngx-lightbox';
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';
import { PagesRoutingModule } from "./pages-routing.module";
import { SharedModule } from "../shared/shared.module";
import { TasksComponent } from './tasks/tasks.component';
import { ActivityComponent } from './activity/activity.component';
import { AreaComponent } from './area/area.component';
import { MachineAreaComponent } from './machine-area/machine-area.component';
import { IdentityTaskComponent } from './tasks/identity-task/identity-task.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { AchievementsComponent } from './achievements/achievements.component';
import { CountUpDirective } from '../core/directive/count-up.directive';
import { FindingComponent } from './finding/finding.component';
import { NgxLoadingModule } from 'ngx-loading';
import { FullCalendarModule } from '@fullcalendar/angular';
import { PlannerTaskComponent } from './planner-task/planner-task.component';
import { DetailTaskComponent } from './planner-task/detail-task/detail-task.component';
import { DateAgoPipe } from '../core/pipe/date-ago.pipe';
import { LayoutModule } from '@angular/cdk/layout';
import { NotFoundComponent } from './not-found/not-found.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DetailActivityComponent } from './planner-task/detail-activity/detail-activity.component';

@NgModule({
  declarations: [
    TasksComponent,
    ActivityComponent,
    AreaComponent,
    MachineAreaComponent,
    IdentityTaskComponent,
    AchievementsComponent,
    CountUpDirective,
    FindingComponent,
    PlannerTaskComponent,
    DetailTaskComponent,
    DateAgoPipe,
    NotFoundComponent,
    UserManagementComponent,
    DetailActivityComponent
  ],
  imports: [
    LayoutModule,
    CommonModule,
    FormsModule,
    FlatpickrModule.forRoot(),
    NgApexchartsModule,
    LeafletModule,
    NgbDropdownModule,
    SimplebarAngularModule,
    PagesRoutingModule,
    SharedModule,
    LightboxModule,
    DropzoneModule,
    NgbAlertModule,
    NgbDatepickerModule,
    AutocompleteLibModule,
    NgxLoadingModule,
    NgbTooltipModule,
    ReactiveFormsModule,
    FullCalendarModule,
    NgbNavModule
  ],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule { 
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
