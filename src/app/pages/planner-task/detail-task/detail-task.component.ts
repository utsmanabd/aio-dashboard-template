import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { result } from 'lodash';
import { CommonService } from 'src/app/core/services/common.service';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { Const } from 'src/app/core/static/const';

interface ActiveArea {
  area: string;
  area_id: number;
}

@Component({
  selector: 'app-detail-task',
  templateUrl: './detail-task.component.html',
  styleUrls: ['./detail-task.component.scss']
})
export class DetailTaskComponent {
  breadCrumbItems: Array<{}>;
  dateSelected: any
  loading: boolean = false

  isAreaSelected: boolean = false

  columnData = ["#", "Activity / Standard", "Category", "Period", "Machine Area", "Last Updated", "Recommended"]
  activityData: any[] = []
  areaData: any[] = []
  filteredActivityData: any[] = []

  activeArea: ActiveArea = {
    area: '',
    area_id: -1,
  }

  index: number = 0

  activityIdData: number[] = []

  constructor(private route: ActivatedRoute, private router: Router, private apiService: restApiService, public common: CommonService) {
    this.breadCrumbItems = [
      { label: 'Planner' },
      { label: 'Tasks' },
      { label: 'Detail', active: true },
    ];
  }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.dateSelected = params['date']
    })
    await this.getActivityData().finally(() => this.loading = false)
    
  }

  async getActivityData() {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.getActivityData().subscribe({
        next: (res: any) => {
          this.activityData = res.data
          let areaData: any[] = []
          for (let data of this.activityData) {
            areaData.push({area_id: data.area_id, area: data.area, image: data.image_area})
          }
          if (areaData.length > 0) {
            this.areaData = this.common.getUniqueData(areaData, 'area_id')
          }
        },
        error: (err) => {
          reject(err);
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Activity"), err)
        },
        complete: () => {
          resolve(true)
        }
      })
    })
  }

  backToArea() {
    this.isAreaSelected = false
  }

  onAreaClick(id: number, area: string) {
    this.filteredActivityData = this.activityData.filter(data => data.area_id == id)
    this.filteredActivityData.forEach((data) => {
      data.is_selected = this.isRecommended(this.common.getDayCount(data.last_updated, this.dateSelected), this.common.getPeriodDayCount(data.periode))
    })
    this.isAreaSelected = true
    const activeArea: ActiveArea = {area: area, area_id: id}
    this.activeArea = activeArea
  }

  isRecommended(dayDifference: number | null, dayPeriod: number): boolean {
    if (dayDifference != null) {
      return dayDifference >= dayPeriod ? true : false
    }
    else return true
  }

  onActivityCheck(event: any) {
    const id = event.target.value
    const checked = event.target.checked
    console.log(`Checked: ${checked}. ID: ${id}`);
  }

  onChecklistAll(event: any) {
    this.filteredActivityData.forEach((activity) => {
      event.target.checked ? activity.is_selected = true : activity.is_selected = false
    })
  }

  onCreateTask(areaId: number) {
    let taskData = { area_id: areaId, date: this.dateSelected}
    this.insertTaskData(taskData).then((taskId) => {
      let activityData: any[] = []
      this.filteredActivityData.forEach((activity) => {
        if (activity.is_selected) {
          activityData.push({
            task_id: taskId,
            activity_id: activity.activity_id
          })
        }
      })
      if (activityData.length > 0) {
        this.insertTaskActivity(activityData)
      }
    })
  }

  insertTaskActivity(activityData: any) {
    this.apiService.insertTaskActivity(activityData).subscribe({
      next: (res: any) => {
        this.common.showSuccessAlert("Task created successfully")
        this.router.navigate(['/planner/tasks'])
      },
      error: (err) => {
        console.error(err)
        this.common.showErrorAlert(Const.ERR_INSERT_MSG("Activity"), err)
      }
    })
  }

  async insertTaskData(taskData: any) {
    return new Promise((resolve, reject) => {
      this.apiService.insertTaskData(taskData).subscribe({
        next: (res: any) => {
          let taskId = res.data[0]
          resolve(taskId)
        },
        error: (err: any) => {
          reject(err)
          console.error(err)
          this.common.showErrorAlert(Const.ERR_INSERT_MSG("Task"), err)
        }
      })
    })
  }


  
}
