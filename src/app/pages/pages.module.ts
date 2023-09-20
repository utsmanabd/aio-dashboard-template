import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbToastModule, NgbProgressbarModule, NgbAlertModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

import { FlatpickrModule } from 'angularx-flatpickr';
import { CountToModule } from 'angular-count-to';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { ToastsContainer } from './dashboards/dashboard/toasts-container.component';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';

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
import { GlobalComponent } from '../global-component';
import { TasksComponent } from './tasks/tasks.component';
import { ActivityComponent } from './activity/activity.component';
import { AreaComponent } from './area/area.component';
import { MachineAreaComponent } from './machine-area/machine-area.component';
import { IdentityTaskComponent } from './tasks/identity-task/identity-task.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { AchievementsComponent } from './achievements/achievements.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  url: `${GlobalComponent.API_URL}${GlobalComponent.upload}`,
  maxFilesize: 50,
  headers: {"Authorization": `${localStorage.getItem('token')}`},
  acceptedFiles: 'image/*',
  addRemoveLinks: true
};

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
    AchievementsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlatpickrModule.forRoot(),
    CountToModule,
    NgApexchartsModule,
    LeafletModule,
    NgbDropdownModule,
    SimplebarAngularModule,
    PagesRoutingModule,
    SharedModule,
    NgxUsefulSwiperModule ,
    LightboxModule,
    DashboardsModule,
    DropzoneModule,
    NgbAlertModule,
    NgbDatepickerModule,
    AutocompleteLibModule
  ],
  // providers: [
  //   {
  //     provide: DROPZONE_CONFIG,
  //     useValue: DEFAULT_DROPZONE_CONFIG
  //   }
  // ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule { 
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
