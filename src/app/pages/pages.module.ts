import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbToastModule, NgbProgressbarModule, NgbAlertModule, NgbDatepickerModule, NgbTooltipModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { FlatpickrModule } from 'angularx-flatpickr';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { ToastsContainer } from './dashboards/dashboard/toasts-container.component';
import { DropzoneModule } from 'ngx-dropzone-wrapper';

// Swiper Slider
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';

import { LightboxModule } from 'ngx-lightbox';

// Load Icons
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

// Pages Routing
import { PagesRoutingModule } from "./pages-routing.module";
import { SharedModule } from "../shared/shared.module";
import { DashboardComponent } from './dashboards/dashboard/dashboard.component';
import { DashboardsModule } from "./dashboards/dashboards.module";
import { ActorComponent } from './actor/actor.component';
import { FilmComponent } from './film/film.component';
import { AddUserComponent } from './actor/add-user/add-user.component';
import { TasksComponent } from './tasks/tasks.component';
import { ActivityComponent } from './activity/activity.component';
import { AreaComponent } from './area/area.component';
import { MachineAreaComponent } from './machine-area/machine-area.component';
import { IdentityTaskComponent } from './tasks/identity-task/identity-task.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { AchievementsComponent } from './achievements/achievements.component';
import { CountUpDirective } from '../core/directive/count-up.directive';
import { FindingComponent } from './finding/finding.component';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';
import { FullCalendarModule } from '@fullcalendar/angular';
import { PlannerTaskComponent } from './planner-task/planner-task.component';
import { DetailTaskComponent } from './planner-task/detail-task/detail-task.component';
import { DateAgoPipe } from '../core/pipe/date-ago.pipe';
import { LayoutModule } from '@angular/cdk/layout';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [
    DashboardComponent,
    ToastsContainer,
    ActorComponent,
    FilmComponent,
    AddUserComponent,
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
    NotFoundComponent
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
    DashboardsModule,
    DropzoneModule,
    NgbAlertModule,
    NgbDatepickerModule,
    AutocompleteLibModule,
    NgxLoadingModule,
    NgbTooltipModule,
    ReactiveFormsModule,
    FullCalendarModule,
    NgbNavModule
    //   .forRoot({
    //   animationType: ngxLoadingAnimationTypes.threeBounce,
    //   backdropBackgroundColour: 'rgba(0,0,0,0)', 
    //   primaryColour: '#49ABE0', 
    //   secondaryColour: '#49ABE0', 
    //   tertiaryColour: '#49ABE0'
    // })
  ],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule { 
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
