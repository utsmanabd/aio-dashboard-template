import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { Const } from 'src/app/core/static/const';
import {
  CalendarOptions,
  EventClickArg,
} from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { TokenStorageService } from 'src/app/core/services/token-storage.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  tableColumn = ["#", "Date", "Area", "Progress", "Action"];
  tasksData: any[] = [];
  index: number = 0;
  activePages: number[] = [];

  eventData: any[] = []

  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedTasksData: any[] = [];

  searchKeyword: string = "";

  loading: boolean = false
  isTableView: boolean = false;
  userData: any
  
  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: 'dayGridMonth,dayGridWeek,dayGridDay',
      center: 'title',
      right: 'today,prevYear,prev,next,nextYear'
    },
    initialView: "dayGridMonth",
    events: [],
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventClick: this.handleEventClick.bind(this),
  };

  breadCrumbItems!: Array<{}>;

  constructor(
    private apiService: restApiService,
    private route: ActivatedRoute,
    private router: Router,
    public common: CommonService,
    private tokenService: TokenStorageService
  ) {
    this.breadCrumbItems = [
      { label: 'Tasks', active: true }
    ];
  }

  async ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      if (params.tableView === "true") {
        this.isTableView = true
      } else {
        this.isTableView = false
      }
    });

    this.userData = this.tokenService.getUser()
    await this.getTaskData().finally(() => this.loading = false)
  }

  handleEventClick(clickInfo: EventClickArg) {
    const taskId = clickInfo.event.id
    this.router.navigate([`/tasks/identity-task/${taskId}`])
  }

  onIdentityTaskClick(tasks: any): void {
    let taskId = tasks.task_id
    this.router.navigate([`/tasks/identity-task/${taskId}`]);
  }

  onSelectedViewCheck(event: any) {
    if (event.target.id == 'btnCalendar') {
      this.isTableView = false
      this.router.navigate(["/tasks"], {
        queryParams: { tableView: false },
      });
    } else if (event.target.id == 'btnTableView') {
      this.isTableView = true
      this.router.navigate(["/tasks"], {
        queryParams: { tableView: true },
      });
    }
  }

  async getTaskData() {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.getTaskData().subscribe({
        next: (res: any) => {
          let data: any[] = res.data
          if (this.userData.area_id <= -1) {
            this.tasksData = data;
          } else {
            this.tasksData = data.filter(task => task.area_id == this.userData.area_id);
          }
        },
        error: (err) => {
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Task"), err);
          console.error(err)
          reject(err)
        },
        complete: () => {
          this.totalPages = Math.ceil(this.tasksData.length / this.pageSize);
          this.updatePagination(this.tasksData);
          let areaData: any[] = []
          for (let area of this.tasksData) {
            if (!areaData.includes(area.area_id)) {
              areaData.push(area.area_id)
            }
          }
          if (areaData.length > 0) {
            this.tasksData.forEach((task) => {
              this.eventData.push({
                id: task.task_id,
                date: task.date,
                title: `${task.area}: ${this.common.getTaskPercentage(task.total_activity, task.checklist)}%`,
                allDay: true,
                backgroundColor: this.common.getTaskAreaColor(task.area_id, areaData),
                allData: task,
                donePercentage: this.common.getTaskPercentage(task.total_activity, task.checklist)
              })
            })
            this.calendarOptions.events = this.eventData
          }
          resolve(true)
        }
      });
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

    this.activePages = this.common.calculateActivePages(this.currentPage, this.totalPages);
  }

  applyFilter(): void {
    this.currentPage = 1;
    const filteredTasksData = this.tasksData.filter(
      (activity: any) =>      
        activity.area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
    this.totalPages = Math.ceil(filteredTasksData.length / this.pageSize);
    this.updatePagination(filteredTasksData);
  }
}
