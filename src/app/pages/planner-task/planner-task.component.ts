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

@Component({
  selector: "app-planner-task",
  templateUrl: "./planner-task.component.html",
  styleUrls: ["./planner-task.component.scss"],
})
export class PlannerTaskComponent {
  breadCrumbItems!: Array<{}>;
  taskData: any

  calendarEvents!: any[];
  editEvent: any;
  formEditData!: UntypedFormGroup;
  newEventDate: any;
  category!: any[];
  submitted = false;

  formData!: UntypedFormGroup;

  eventData: any[] = []

  loading: boolean = false

  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: "dayGridMonth",
    events: [],
    weekends: true,
    // editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    // you c  an update a remote database when these fire:
    eventAdd: (arg) => {
      console.log("EVENT ADD");
      console.log("id: ", arg.event.id);
      console.log("title: ", arg.event.title);
      console.log("date: ", arg.event.startStr);
    },
    eventChange: (arg) => {
      console.log("EVENT CHANGE");
      console.log("id: ", arg.event.id);
      console.log("title: ", arg.event.title);
      console.log("date: ", arg.event.startStr);
    },
    eventRemove: (arg) => {
      console.log(`${arg.event.title} removed`);
      this.removeTaskData(+arg.event.id).finally(() => this.loading = false)
    },
  };

  @ViewChild("detailTask") detailModal!: TemplateRef<any>;

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
                date: task.date,
                title: `${task.area}: ${this.common.getTaskPercentage(task.total_activity, task.checklist)}%`,
                allDay: true,
                backgroundColor: this.getTaskAreaColor(task.area_id, areaData),
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

  getTaskAreaColor(areaId: number, areaData: number[]): string {
    let color = ['#4B38B3', '#3577F1', '#45CB85', '#299CDB', '#FFBE0B', '#F06548', '#343A40', '#F3F6F9'];
    let index = areaData.indexOf(areaId);
    
    if (index !== -1) {
      return color[index % color.length];
    } else {
      return color[areaId % color.length];
    }
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const date = selectInfo.startStr;
    const calendarApi = selectInfo.view.calendar;
    this.router.navigate([`/planner/tasks/detail/${date}`]);

    calendarApi.unselect(); // clear date selection

    // if (title) {
    //   calendarApi.addEvent({
    //     id: createEventId(),
    //     title,
    //     start: selectInfo.startStr,
    //     end: selectInfo.endStr,
    //     allDay: selectInfo.allDay,
    //   });
    // }
  }

  handleEventClick(clickInfo: EventClickArg) {
    let taskId = clickInfo.event.id
    if (taskId) {
      // const taskData = clickInfo.event._def.extendedProps
      // this.openModal(this.detailModal, taskData)
      if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
        clickInfo.event.remove();
      }
    }
  }

  openModal(content: any, taskData: any) {
    this.taskData = taskData.allData
    console.log(this.taskData)
		this.modalService.open(content, { centered: true });
	}

  async removeTaskData(taskId: number) {
    new Promise((resolve, reject) => {
      this.loading = true
      this.apiService.updateTaskData(taskId, {is_removed: 1}).subscribe({
        next: (res: any) => {
          console.log(res.data)
          if (res.data > 0) {
            this.apiService.updateTaskActivityByTaskId(taskId, {is_removed: 1}).subscribe({
              next: (res: any) => {
                this.ngOnInit()
                resolve(res.data)
              },
              error: (err) => {
                this.common.showErrorAlert(Const.ERR_DELETE_MSG("Task Activity"), err)
                reject(err)
              }
            })
          }
        },
        error: (err) => this.common.showErrorAlert(Const.ERR_DELETE_MSG("Task"), err)
      })
    })
    
  }

  currentEvents: EventApi[] = [];

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }
}
