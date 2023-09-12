import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { restApiService } from 'src/app/core/services/rest-api.service';

@Component({
  selector: 'app-identity-task',
  templateUrl: './identity-task.component.html',
  styleUrls: ['./identity-task.component.scss']
})
export class IdentityTaskComponent {

  taskId: number | null = null;
  areaId: number | null = null;

  identityTaskData: any
  identityTaskCountData: any

  tableColumns = ["No", "Activity", "Periode", "Category", "Standard", "Condition", "Comment", "Picture", "PIC Name"]
  index: number = 0

  selectedMachineArea!: string
  machineAreaData: any

  mAreaArray: any[]= []

  constructor(private route: ActivatedRoute, private router: Router, private apiService: restApiService) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.taskId = +params['id'] || null
      this.areaId = params["areaId"] || null;
    });
    if (this.areaId !== null) this.getMachineAreaDataByAreaId(this.areaId)
  }

  ngOnDestroy() {
    this.identityTaskData = undefined
  }

  onSelectedMachineArea() {
    console.log(`Clicked: ${this.selectedMachineArea}`)
    if (this.taskId !== null && this.areaId !== null) {
      this.getTaskActivity(this.taskId, this.selectedMachineArea)
    }
  }

  getMachineAreaDataByAreaId(areaId: number) {
    this.apiService.getMachineAreaDataByAreaId(areaId).subscribe({
      next: (res: any) => {
        this.machineAreaData = res.data,
        this.machineAreaData.forEach((element: any) => {
          this.mAreaArray.push(element.m_area_id)
        });
      },
      error: (err) => console.error(err),
      complete: () => this.selectedMachineArea = this.mAreaArray[0]
    })
  }

  getTaskActivity(taskId: any, mAreaId: any) {
    this.apiService.getTaskActivityById(taskId, mAreaId).subscribe({
      next: (res: any) => {
        this.identityTaskData = res.data
        this.getCountTaskActivity(taskId, mAreaId)
      },
      error: (err) => console.error(err)
    })
  }

  getCountTaskActivity(taskId: any, mAreaId: any) {
    this.apiService.getCountTaskActivityById(taskId, mAreaId).subscribe({
      next: (res: any) => this.identityTaskCountData = res.data[0],
      error: (err) => console.error(err)
    })
  }

  changeCondition(e: any) {
    console.log(e.target.value)
  } 

  isConditionOk(condition: any): boolean {
    if (condition === 1) return true
    else return false
  }

  isConditionNotOk(condition: any): boolean {
    if (condition === 0) return true
    else return false
  }

  getComputedRowNumber(index: number): number {
    return this.index + index + 1;
  }

  onSaveChanges() {
    console.log(this.identityTaskData)
  }

  getDate(timestamp: any): string {
    let date = new Date(timestamp).toLocaleDateString()
    return date
  }

  getTaskActivityPercentage(totalActivity: number, totalChecklist: number): number {
    return Math.floor((totalChecklist / totalActivity) * 100)
  }
  
}
