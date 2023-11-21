import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { Const } from 'src/app/core/static/const';
import { GlobalComponent } from 'src/app/global-component';

interface MachineData {
  m_area_id: number,
  machine_area: string
}

@Component({
  selector: 'app-detail-activity',
  templateUrl: './detail-activity.component.html',
  styleUrls: ['./detail-activity.component.scss']
})

export class DetailActivityComponent {
  taskId: number | null = null;

  taskActivityData: any[] = []
  identityTaskData: any[] = [];
  identityTaskCountData: any;

  tableColumns = [
    "No",
    "Activity",
    "Period",
    "Category",
    "Condition",
    "Comment",
    "Picture",
    "PIC Name",
  ];
  index: number = 0;

  machineAreaData: MachineData[] = [{
    m_area_id: 0,
    machine_area: ""
  }];
  selectedMachineId!: number

  searchKeyword: string = "";

  isLoading: boolean = false;
  breadCrumbItems!: Array<{}>;
  userData: any

  today: string

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: restApiService,
    public common: CommonService,
    private tokenService: TokenStorageService,
  ) {
    this.breadCrumbItems = [
      { label: 'Tasks' },
      { label: 'Identity Task', active: true }
    ];

    const date = new Date()
    this.today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  }

  async ngOnInit() {
    this.userData = this.tokenService.getUser()
    this.route.params.subscribe(params => {
      this.taskId = params['task-id']
    })
    if (this.taskId) this.getTaskActivityByTaskId(this.taskId).then(() => {
      this.onTabChange(this.machineAreaData[0].m_area_id)
    })
  }

  onTabChange(mAreaId: number) {
    if (this.taskId && mAreaId) {
      this.selectedMachineId = mAreaId
      this.getTaskActivity(this.taskId, mAreaId);
    }
  }

  async getTaskActivityByTaskId(taskId: number) {
    return new Promise((resolve, reject) => {
      this.isLoading = true
      this.apiService.getTaskActivityById(taskId).subscribe({
        next: (res: any) => {
          this.isLoading = false
          if (res.data.length > 0) {
            this.taskActivityData = res.data
            let areaId = this.taskActivityData[0].area_id
            if (areaId == this.userData.area_id || this.userData.area_id <= -1) {
              let machineArea: any = {};
  
              this.taskActivityData.forEach(item => {
                machineArea[item.machine_area] = item.m_area_id
              })
              this.machineAreaData.splice(0)
              for (let mArea in machineArea) {
                this.machineAreaData.push({machine_area: mArea, m_area_id: machineArea[mArea]})
              }
              resolve(true)
            } else {
              this.router.navigate(['../tasks'])
              this.common.showErrorAlert("You have no access to this area")
            }
            
          } else {
            this.router.navigate(['../tasks'])
            this.common.showErrorAlert("Cannot find Task with ID: " + this.taskId)
          }
        },
        error: (err) => {
          reject(err)
          this.isLoading = false
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Task Activity"), err)
        }
      })
    })
  }

  getTaskActivity(taskId: any, mAreaId: any) {
    let data = this.taskActivityData.filter(item => item.m_area_id == mAreaId)
    this.identityTaskData = data
    this.getCountTaskActivity(taskId, mAreaId)
  }

  getCountTaskActivity(taskId: any, mAreaId: any) {
    this.apiService.getCountTaskActivityById(taskId, mAreaId).subscribe({
      next: (res: any) => this.identityTaskCountData = res.data[0],
      error: (err) => this.common.showErrorAlert(Const.ERR_GET_MSG("Task Activity Count"), err),
      complete: () => {
        console.log(this.identityTaskCountData)
      }
      
    });
  }

  getImageSource(imageUrl: string): string {
    return `${GlobalComponent.API_URL}${GlobalComponent.image}${imageUrl}`
  }

  filterIdentityTaskData() {
    return this.identityTaskData.filter(
      (data: any) =>
        data.activity
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        data.periode
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        data.category
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        data.standard
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
  }
}
