import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { restApiService } from 'src/app/core/services/rest-api.service';
import { ActivityFormData } from './form-data.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  tableColumn = ["#", "Activity", "Machine Area", "Area", "Category", "Standard", "Periode"];
  periodData = ['W', '2W', 'M', '2M', '3M', '4M', '6M', '1Y']
  keyword = 'period';

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
  successMessage: string = "";
  isSuccess: boolean = false;

  isMachineAreaEmpty: boolean = false;
  isCategoryEmpty: boolean = false;
  isActivityEmpty: boolean = false;
  isStandardEmpty: boolean = false;
  isPeriodEmpty: boolean = false;
  isEmpty: boolean[] = []

  constructor(
    private apiService: restApiService,
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params.success === "true") {
        this.successMessage = "Data has been updated!";
        this.isSuccess = true;
      }
    });
    this.getActivityData();
    this.getMachineAreaData();
  }

  onSubmitData() {
    this.validateForm()
    if (!this.isEmpty.includes(true)) {
      if (this.activityId !== undefined) {
        this.updateActivityData(this.activityId, this.activityFormData)
      } else {
        this.insertActivityData(this.activityFormData)
      }
    }
  }

  onDeleteData(id: any) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(3, 142, 220)",
      cancelButtonColor: "rgb(243, 78, 78)",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.value) {
        const deleteData = { is_removed: 1 };
        this.apiService.updateActivityData(id, deleteData)
          .subscribe((res: any) => {
            if (res.data == 1) {
              this.apiService.cachedActivityData = undefined;
              this.getActivityData();
              Swal.fire({
                title: "Deleted!",
                text: "Area has been deleted.",
                confirmButtonColor: "rgb(3, 142, 220)",
                icon: "success",
              });
            }
          });
      }
    });
  }

  updateActivityData(id: any, data: any) {
    this.apiService.updateActivityData(id, data).subscribe({
      next: (res: any) => this.modalService.dismissAll(),
      error: (err: any) => console.error(err),
      complete: () => {
        this.apiService.cachedActivityData = undefined;
        this.getActivityData()
      }
    })
  }

  insertActivityData(data: any) {
    this.apiService.insertActivityData(data).subscribe({
      next: (res: any) => this.modalService.dismissAll(),
      error: (err: any) => console.error(err),
      complete: () => {
        this.apiService.cachedActivityData = undefined;
        this.getActivityData()
      }
    })
  }

  getActivityData() {
    this.apiService.getActivityData().subscribe({
      next: (res: any) => {
        this.activityData = res.data;
        // this.machineAreaData = Array.from(new Set(this.activityData.map((item: any) => item.m_area_id)))
        this.totalPages = Math.ceil(this.activityData.length / this.pageSize);
        this.updatePagination(this.activityData);
      },
      error: (err) => console.error(err)
    });
  }

  getMachineAreaData() {
    this.apiService.getMachineAreaData().subscribe({
      next: (res: any) => this.machineAreaData = res.data,
      error: (err: any) => console.error(err),
      complete: () => {
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
    this.isPeriodEmpty = this.activityFormData.periode.trim() === '';
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
