import { DatePipe } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { restApiService } from "src/app/core/services/rest-api.service";
import { createEventId } from "./data";
import {
  CalendarOptions,
  DateSelectArg,
  EventApi,
  EventClickArg,
} from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { Router } from "@angular/router";
import { CommonService } from "src/app/core/services/common.service";
import { Const } from "src/app/core/static/const";
import { result } from "lodash";
import { FullCalendarComponent } from "@fullcalendar/angular";

@Component({
  selector: "app-planner-task",
  templateUrl: "./planner-task.component.html",
  styleUrls: ["./planner-task.component.scss"],
})
export class PlannerTaskComponent {
  breadCrumbItems!: Array<{}>;
  taskData: any

  eventData: any[] = []

  loading: boolean = false

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
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    // you c  an update a remote database when these fire:
    eventAdd: (arg) => {},
    eventChange: (arg) => {
      const newDate = {date: arg.event.startStr}
      this.updateTaskData(+arg.event.id, newDate)
    },
    eventRemove: (arg) => {
      this.removeTaskData(+arg.event.id).finally(() => this.loading = false)
    },
  };

  @ViewChild("detailTask") detailModal!: TemplateRef<any>;
  @ViewChild("calendar") calendarComponent!: FullCalendarComponent

  constructor(
    private modalService: NgbModal,
    private apiService: restApiService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    public common: CommonService
  ) {}

  async ngOnInit() {
    this.breadCrumbItems = [
      { label: "Planner" },
      { label: "Tasks", active: true },
    ];
    await this.getTaskData().finally(() => this.loading = false)
  }

  ngOnDestroy() {
    this.modalService.dismissAll()
  }

  async getTaskData() {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.getTaskData().subscribe({
        next: (res: any) => {
          let data: any[] = res.data
          let areaData: any[] = []
          for (let area of data) {
            if (!areaData.includes(area.area_id)) {
              areaData.push(area.area_id)
            }
          }
          if (areaData.length > 0) {
            data.forEach((task) => {
              this.eventData.push({
                id: task.task_id,
                start: task.date,
                end: task.is_three_days ? this.common.getThreeDays(task.date) : undefined,
                title: `${task.area}: ${this.common.getTaskPercentage(task.total_activity, task.checklist)}%`,
                allDay: true,
                backgroundColor: this.common.getTaskAreaColor(task.area_id, areaData, true),
                allData: task,
                donePercentage: this.common.getTaskPercentage(task.total_activity, task.checklist)
              })
            })
          }
        },
        error: (err) => {
          reject(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Task"), err)
        },
        complete: () => {
          this.calendarOptions.events = this.eventData
          resolve(true)
        }
      })
    })
  }

  async updateTaskData(taskId: number, data: any) {
    return new Promise((resolve, reject) => {
      this.apiService.updateTaskData(taskId, data).subscribe({
        next: (res: any) => {
          resolve(true)
          console.log("SUCCESS CHANGE DATE")
        },
        error: (err) => {
          this.common.showErrorAlert(Const.ERR_UPDATE_MSG("Task"), err)
          reject(err)
        }
      })
    })
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    console.log(selectInfo)
    const date = selectInfo.startStr;
    this.router.navigate([`/planner/tasks/create/${date}`]);
  }

  handleEventClick(clickInfo: EventClickArg) {
    let taskId = clickInfo.event.id
    console.log(clickInfo.event)
    if (taskId) {
      const taskData = clickInfo.event._def.extendedProps
      const date = clickInfo.event.startStr
      this.openModal(this.detailModal, taskData, date)
    
    }
  }

  onDeleteTask(taskId: number) {
    this.common.showDeleteWarningAlert(Const.ALERT_DEL_MSG("Task")).then(async (result) => {
      if (result.value) {
        await this.removeTaskData(taskId).then((success) => {
          if (success) {
            this.calendarComponent.getApi().getEventById(`${taskId}`)?.remove()
            this.loading = false;
            this.common.showSuccessAlert(Const.SUCCESS_DEL_MSG('Task'))
            this.modalService.dismissAll()
          }
        })
      }
    })
  }

  openModal(content: any, taskData: any, date: string) {
    this.taskData = taskData.allData
    this.taskData.date = date
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll()
    }
		this.modalService.open(content, { centered: true });
	}

  async removeTaskData(taskId: number) {
    return new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.updateTaskData(taskId, {is_removed: 1}).subscribe({
        next: async (res: any) => {
          console.log(res.data)
          if (res.data > 0) {
            this.apiService.updateTaskActivityByTaskId(taskId, {is_removed: 1}).subscribe({
              next: (res: any) => {
                this.ngOnInit()
                resolve(true)
              },
              error: (err) => {
                reject(err)
                this.loading = false
                this.common.showErrorAlert(Const.ERR_DELETE_MSG("Task Activity"), err)
              }
            })
          }
        },
        error: (err) => {
          this.loading = false
          this.common.showErrorAlert(Const.ERR_DELETE_MSG("Task"), err)
          reject(err)
        }
      })
    })
    
  }
}
