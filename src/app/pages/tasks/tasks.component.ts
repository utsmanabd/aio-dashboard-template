import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { restApiService } from 'src/app/core/services/rest-api.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  tableColumn = ["#", "Date", "Area", "Progress", "Action"];
  tasksData: any;
  areaData: any;
  activityIdData: any[] =[]
  index: number = 0;
  activePages: number[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedTasksData: any[] = [];
  pages: number[] = [];

  searchKeyword: string = "";
  successMessage: string = "";
  isSuccess: boolean = false;

  selectedArea!: string
  selectedDate: string = ''
  isSelectedAreaEmpty: boolean = false
  isSelectedDateEmpty: boolean = false

  areaIdArray: any[] = []
  isLoading: boolean = false
  

  constructor(
    private apiService: restApiService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params.success === "true") {
        this.successMessage = "Data has been updated!";
        this.isSuccess = true;
      }
    });
    this.getTaskData();
    this.getAreaData();
  }

  ngOnDestroy() {
    this.activityIdData = []
  }

  onAddTask() {
    this.validateForm()
    if (!this.isSelectedAreaEmpty && !this.isSelectedDateEmpty) {
      let taskData = {
        area_id: this.selectedArea,
        date: this.selectedDate
      }
      this.insertTaskData(taskData)
      this.isLoading = true
    }
  }
  
  insertTaskData(data: any) {
    this.apiService.insertTaskData(data).subscribe({
      next: (res: any) => {
        if (res.data.length > 0) {
          this.getActivityByAreaId(res.data[0], data.area_id)
        }
      },
      error: (err: any) => console.error(err),
      complete: () => {
        this.apiService.cachedTaskData = undefined
        this.getTaskData()
      }
    })
  }

  getActivityByAreaId(taskId: any, areaId: any) {
    this.apiService.getActivityDataByAreaId(areaId).subscribe({
      next: (res: any) => {
        let areaData: any[] = res.data
        areaData.forEach(data => {
          this.activityIdData.push({
            task_id: taskId, 
            activity_id: data.activity_id
          })
        })
      },
      error: (err) => console.error(err),
      complete: () => {
        if (this.activityIdData.length > 0) {
          this.insertTaskActivity(this.activityIdData)
        }
      }
    })
  }

  insertTaskActivity(data: any) {
    this.apiService.insertTaskActivity(data).subscribe({
      next: (res) => this.modalService.dismissAll(),
      error: (err) => console.error(err)
    })
  }

  openModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => this.resetModalValue(),
			(reason) => this.resetModalValue()
    )
  }

  resetModalValue() {
    if (this.areaData !== undefined) {
      this.selectedArea = this.areaIdArray[0]
    } else this.selectedArea = ''
    this.selectedDate = ''
    this.activityIdData = []
    this.isSelectedDateEmpty = false
    this.isLoading = false
  }

  onIdentityTaskClick(tasks: any): void {
    let taskId = tasks.task_id
    this.router.navigate([`/tasks/identity-task`, taskId], {
      queryParams: {
        id: taskId,
        areaId: tasks.area_id,
      },
    });
  }

  validateForm() {
    this.isSelectedAreaEmpty = this.selectedArea === ""
    this.isSelectedDateEmpty = this.selectedDate.trim() === ""
  }

  getTaskData() {
    this.apiService.getTaskData().subscribe({
      next: (res: any) => {
        this.tasksData = res.data;
        this.totalPages = Math.ceil(this.tasksData.length / this.pageSize);
        this.updatePagination(this.tasksData);
      },
      error: (err) => console.error(err)
    });
  }

  getAreaData() {
    this.apiService.getAreaData().subscribe({
      next: (res: any) => {
        this.areaData = res.data;
        this.areaData.forEach((element: any) => {
          this.areaIdArray.push(element.area_id)
        });
      },
      error: (err) => console.error(err),
      complete: () => this.selectedArea = this.areaIdArray[0]
    })
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.tasksData);
    }
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedTasksData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.calculateActivePages();
  }

  calculateActivePages(): number[] {
    const visiblePages = 5; // Number of visible pages
    const activePages: number[] = [];

    const startPage = Math.max(
      1,
      this.currentPage - Math.floor(visiblePages / 2)
    );
    const endPage = Math.min(this.totalPages, startPage + visiblePages - 1);

    for (let page = startPage; page <= endPage; page++) {
      activePages.push(page);
    }

    return activePages;
  }

  getComputedRowNumber(index: number): number {
    return this.index + index + 1;
  }

  getDate(timestamp: any): string {
    let date = new Date(timestamp).toLocaleDateString()
    return date
  }

  applyFilter(): void {
    this.currentPage = 1;
    const filteredTasksData = this.tasksData.filter(
      (activity: any) =>      
        activity.area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.progress
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
    this.totalPages = Math.ceil(filteredTasksData.length / this.pageSize);
    this.updatePagination(filteredTasksData);
  }

  getTaskPercentage(totalActivity: number, totalChecklist: number): number {
    let result = Math.floor((totalChecklist / totalActivity) * 100);
    if (isNaN(result)) result = 0
    return result
  }

  getPercentageBadge(percentage: number): string {
    switch (true) {
      case percentage < 35:
        return 'danger';
      case percentage < 70:
        return 'warning';
      case percentage < 100:
        return 'success';
      case percentage === 100:
        return 'secondary';
      default:
        return 'primary';
    }
  }
}
