import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { DashboardComponent } from "./dashboards/dashboard/dashboard.component";
import { ActorComponent } from './actor/actor.component';
import { FilmComponent } from './film/film.component';
import { AddUserComponent } from './actor/add-user/add-user.component';
import { TasksComponent } from './tasks/tasks.component';
import { ActivityComponent } from './activity/activity.component';
import { AreaComponent } from './area/area.component';
import { MachineAreaComponent } from './machine-area/machine-area.component';

const routes: Routes = [
    {
        path: "",
        component: DashboardComponent
    },
    {
      path: '', loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
    },
    {
      path: 'user',
      component: ActorComponent,
    },
    {
      path: 'user/add',
      component: AddUserComponent
    },
    {
      path: 'user/edit',
      redirectTo: 'user'
    },
    {
      path: 'user/edit/:id',
      component: AddUserComponent
    },
    {
      path: 'achievements',
      component: FilmComponent
    },
    {
      path: 'tasks',
      component: TasksComponent
    },
    {
      path: 'master/activity',
      component: ActivityComponent
    },
    {
      path: 'master/area',
      component: AreaComponent
    },
    {
      path: 'master/machine-area',
      component: MachineAreaComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
