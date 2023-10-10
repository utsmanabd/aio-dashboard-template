import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { calendarEvents, category, createEventId } from './data';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/core';
import Swal from 'sweetalert2';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

@Component({
  selector: 'app-film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss']
})
export class FilmComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  // calendar
  calendarEvents!: any[];
  editEvent: any;
  formEditData!: UntypedFormGroup;
  newEventDate: any;
  category!: any[];
  submitted = false;

  // Calendar click Event
  formData!: UntypedFormGroup;
  @ViewChild('editmodalShow') editmodalShow!: TemplateRef<any>;
  @ViewChild('modalShow') modalShow !: TemplateRef<any>;

  constructor(private modalService: NgbModal, private formBuilder: UntypedFormBuilder, private datePipe: DatePipe, private restApiService: restApiService, private changeDetector: ChangeDetectorRef) { }

  ngOnInit(): void {
    console.log('TEEEE')
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Apps' },
      { label: 'Calendar', active: true }
    ];

    // Validation
    // this.formData = this.formBuilder.group({
    //   title: ['', [Validators.required]],
    //   category: ['', [Validators.required]],
    //   location: ['', [Validators.required]],
    //   description: ['', [Validators.required]],
    //   date: ['', Validators.required],
    //   start: ['', Validators.required],
    //   end: ['', Validators.required]
    // });

    // this._fetchData();
  }
  calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin
    ],
    initialView: 'dayGridMonth',
    events: [
      { id: createEventId(), title: 'event 1', date: '2023-10-27', allDay: true },
      { id: createEventId(), title: 'event 2', date: '2023-10-28', allDay: true, display: 'background', backgroundColor: 'red' },
      { id: createEventId(), title: 'event 2', date: '2023-10-29', allDay: true, display: 'background', backgroundColor: 'green' },
      { id: createEventId(), title: 'event 2', date: '2023-10-30', allDay: true},
    ],
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    // you c  an update a remote database when these fire:
    eventAdd: (arg) => {
      console.log("id: ", arg.event.id)
      console.log("title: ", arg.event.title)
      console.log("date: ", arg.event.startStr)
    },
    eventChange: (arg) => {
      console.log("id: ", arg.event.id)
      console.log("title: ", arg.event.title)
      console.log("date: ", arg.event.startStr)
    },
    eventRemove: (arg) => {
      console.log(`${arg.event.title} removed`)
    }
  };

  handleDateSelect(selectInfo: DateSelectArg) {
    console.log(selectInfo)
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    console.log(clickInfo.event)
    if (clickInfo.event.id !== "") {
      confirm("YOHOO")
    }
    // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    //   clickInfo.event.remove();
    // }
  }

  currentEvents: EventApi[] = [];

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }
}
