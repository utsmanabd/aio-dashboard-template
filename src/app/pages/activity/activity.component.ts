import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { ActivityFormData } from './form-data.model';
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common.service';
import { Const } from 'src/app/core/static/const';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  tableColumn = ["#", "Activity", "Machine Area", "Area", "Category", "Standard", "Periode", "Action"];
  periodData = ['W', '2W', 'M', '2M', '3M', '4M', '6M', '1Y']
  keyword = 'period';

  breadCrumbItems!: Array<{}>;

  activityFormData: ActivityFormData = {
    m_area_id: '',
    category_id: '1',
    name: '',
    standard: '',
    periode: ''
  }

  activityFormDataBefore!: ActivityFormData

  activityId: any
  activityData: any;
  machineAreaData: any;
  index: number = 0;
  activePages: number[] = [];
  filteredActivityData: any[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedActivityData: any[] = [];
  pages: number[] = [];

  searchKeyword: string = "";

  isMachineAreaEmpty: boolean = false;
  isCategoryEmpty: boolean = false;
  isActivityEmpty: boolean = false;
  isStandardEmpty: boolean = false;
  isPeriodEmpty: boolean = false;
  isEmpty: boolean[] = []

  loading: boolean = false;
  isLoading: boolean = false;

  constructor(
    private apiService: restApiService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    public common: CommonService
  ) {
    this.breadCrumbItems = [
      { label: 'Master Data' },
      { label: 'Activity', active: true }
    ];
  }

  ngOnInit() {
    this.getActivityData()
    this.getMachineAreaData()
  }

  ngOnDestroy() {
    this.modalService.dismissAll()
  }

  onSubmitData() {
    this.validateForm()
    if (!this.isEmpty.includes(true)) {
      if (this.activityId !== undefined) {
        this.activityFormData.periode = this.activityFormData.periode.toUpperCase()
        this.updateActivityData(this.activityId, this.activityFormData)
      } else {
        this.activityFormData.periode = this.activityFormData.periode.toUpperCase()
        this.insertActivityData(this.activityFormData)
      }
    }
  }

  onDeleteData(id: any) {
    this.common.showDeleteWarningAlert().then((result) => {
      if (result.value) {
        const deleteData = { is_removed: 1 };
        this.loading = true
        this.apiService.updateActivityData(id, deleteData)
          .subscribe({
            next: (res: any) => {
              if (res.data == 1) {
                this.getActivityData();
                this.common.showSuccessAlert('Activity has been deleted')
              }
              this.loading = false
            },
            error: (err) => {
              this.loading = false
              console.error(err);
              this.common.showErrorAlert(Const.ERR_DELETE_MSG('Activity'), err)
            }
          });
      }
    });
  }

  updateActivityData(id: any, data: any) {
    this.isLoading = true
    this.apiService.updateActivityData(id, data).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll()
        this.isLoading = false
      },
      error: (err: any) => {
        this.isLoading = false
        console.error(err)
        this.common.showErrorAlert(Const.ERR_UPDATE_MSG("Activity"), err)
      },
      complete: () => this.getActivityData()
    })
  }

  insertActivityData(data: any) {
    this.isLoading = true
    this.apiService.insertActivityData(data).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll()
        this.isLoading = false
      },
      error: (err: any) => {
        console.error(err)
        this.isLoading = false
        this.common.showErrorAlert(Const.ERR_INSERT_MSG("Activity"), err)
      },
      complete: () => this.getActivityData()
    })
  }

  getActivityData() {
    this.loading = true
      this.apiService.getActivityData().subscribe({
        next: (res: any) => {
          this.loading = false
          this.activityData = res.data;
          // this.machineAreaData = Array.from(new Set(this.activityData.map((item: any) => item.m_area_id)))
          this.totalPages = Math.ceil(this.activityData.length / this.pageSize);
          this.updatePagination(this.activityData);
        },
        error: (err) => {
          this.loading = false
          console.error(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Activity"), err)
        }
      });
  }

  getMachineAreaData() {
    this.loading = true
      this.apiService.getMachineAreaData().subscribe({
        next: (res: any) => this.machineAreaData = res.data,
        error: (err: any) => {
          this.loading = false
          console.error(err)
          this.common.showServerErrorAlert(Const.ERR_GET_MSG("Machine Area"), err)
        },
        complete: () => {
          this.loading = false
          this.activityFormData.m_area_id = `${this.machineAreaData[0].m_area_id}`
          this.activityFormDataBefore = {...this.activityFormData}
        }
      })
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.activityData);
    }
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedActivityData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.common.calculateActivePages(this.currentPage, this.totalPages);
    console.log(this.activePages)
  }

  applyFilter(): void {
    this.currentPage = 1;
    const filteredActivityData = this.activityData.filter(
      (activity: any) =>
        activity.area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.machine_area
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.activity
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.category
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.standard
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase()) ||
        activity.periode
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
    this.totalPages = Math.ceil(filteredActivityData.length / this.pageSize);
    this.updatePagination(filteredActivityData);
  }

  selectEvent(item: any) {  }
  onChangeSearch(search: any) {}
  onFocused(e: any) { }

  validateForm() {
    this.isEmpty = []
    this.isMachineAreaEmpty = this.activityFormData.m_area_id === '';
    this.isCategoryEmpty = this.activityFormData.category_id === '';
    this.isActivityEmpty = this.activityFormData.name.trim() === '';
    this.isStandardEmpty = this.activityFormData.standard.trim() === '';
    this.isPeriodEmpty = !/^[0-9]*[DWMY]$/.test(this.activityFormData.periode.trim().toUpperCase())
    this.isEmpty.push(this.isMachineAreaEmpty, this.isCategoryEmpty, this.isActivityEmpty, this.isStandardEmpty, this.isPeriodEmpty)
    console.log(this.isEmpty)
  }

  openModal(content: any, activityData?: any) {
    if (activityData !== undefined) {
      this.activityId = activityData.activity_id
      this.activityFormData.m_area_id = activityData.m_area_id;
      this.activityFormData.category_id = activityData.category_id;
      this.activityFormData.name = activityData.activity;
      this.activityFormData.periode = activityData.periode;
      this.activityFormData.standard = activityData.standard;
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => this.resetModalValue(),
			(reason) => this.resetModalValue()
    )
  }

  resetModalValue() {
    this.isEmpty = []
    this.activityId = undefined
    this.isMachineAreaEmpty = false;
    this.isCategoryEmpty =  false;
    this.isActivityEmpty =  false;
    this.isStandardEmpty =  false;
    this.isPeriodEmpty =  false;
    this.activityFormData = this.activityFormDataBefore
    this.activityFormDataBefore = {...this.activityFormData}
  }
}
