import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Component pages
import { TasksComponent } from './tasks/tasks.component';
import { ActivityComponent } from './activity/activity.component';
import { AreaComponent } from './area/area.component';
import { MachineAreaComponent } from './machine-area/machine-area.component';
import { IdentityTaskComponent } from './tasks/identity-task/identity-task.component';
import { AchievementsComponent } from './achievements/achievements.component';
import { FindingComponent } from './finding/finding.component';
import { PlannerTaskComponent } from './planner-task/planner-task.component';
import { DetailTaskComponent } from './planner-task/detail-task/detail-task.component';
import { LevelGuard } from '../core/guards/level.guard';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
    {
        path: '',
        component: AchievementsComponent
    },
    {
      path: 'tasks',
      component: TasksComponent
    },
    {
      path: 'tasks/identity-task',
      redirectTo: 'tasks'
    },
    {
      path: 'tasks/identity-task/:task-id',
      component: IdentityTaskComponent
    },

    // Admin Route:
    {
      path: 'planner/tasks',
      component: PlannerTaskComponent,
      canActivate: [LevelGuard],
      data: { expectedLevel: "Admin" }
    },
    {
      path: 'planner/tasks/create/:date',
      component: DetailTaskComponent,
      canActivate: [LevelGuard],
      data: { expectedLevel: "Admin" }
    },
    {
      path: 'planner/finding',
      component: FindingComponent,
      canActivate: [LevelGuard],
      data: { expectedLevel: "Admin" }
    },
    {
      path: 'master/activity',
      component: ActivityComponent,
      canActivate: [LevelGuard],
      data: { expectedLevel: "Admin" }
    },
    {
      path: 'master/area',
      component: AreaComponent,
      canActivate: [LevelGuard],
      data: { expectedLevel: "Admin" }
    },
    {
      path: 'master/machine-area',
      component: MachineAreaComponent,
      canActivate: [LevelGuard],
      data: { expectedLevel: "Admin" }
    },
    {
      path: 'master/users',
      component: UserManagementComponent,
      canActivate: [LevelGuard],
      data: { expectedLevel: "Admin" }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
