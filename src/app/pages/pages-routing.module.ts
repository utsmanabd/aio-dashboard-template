import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { DashboardComponent } from "./dashboards/dashboard/dashboard.component";
import { ActorComponent } from './actor/actor.component';
import { FilmComponent } from './film/film.component';
import { AddUserComponent } from './actor/add-user/add-user.component';

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
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
