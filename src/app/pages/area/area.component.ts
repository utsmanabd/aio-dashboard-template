import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import { restApiService } from 'src/app/core/services/rest-api.service';

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent {
  tableColumn = ["#", "Area", "Detail"];
  areaData: any;
  index: number = 0;
  activePages: number[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages!: number;
  paginatedAreaData: any[] = [];
  pages: number[] = [];

  searchKeyword: string = "";
  successMessage: string = "";
  isSuccess: boolean = false;

  areaId: any
  areaName: string = ""
  areaDetail: string = ""

  isAreaNameEmpty: boolean = false
  isAreaDetailEmpty: boolean = false

  isLoading: boolean = false

  constructor(
    private apiService: restApiService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    public common: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params.success === "true") {
        this.successMessage = "Data has been updated!";
        this.isSuccess = true;
      }
    });
    this.getAreaData();
  }

  getAreaData() {
    this.apiService.getAreaData().subscribe({
      next: (res: any) => {
        this.areaData = res.data;
        this.totalPages = Math.ceil(this.areaData.length / this.pageSize);
        this.updatePagination(this.areaData);
      },
      error: (err) => console.error(err)
    });
    
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination(this.areaData);
    }
  }

  updatePagination(dataSource: any): void {
    this.index = (this.currentPage - 1) * this.pageSize;
    this.paginatedAreaData = dataSource.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );

    this.activePages = this.common.calculateActivePages(this.currentPage, this.totalPages);
  }

  applyFilter(): void {
    this.currentPage = 1;
    const filteredAreaData = this.areaData.filter(
      (activity: any) =>
        activity.name
          .toLowerCase()
          .includes(this.searchKeyword.trim().toLowerCase())
    );
    this.totalPages = Math.ceil(filteredAreaData.length / this.pageSize);
    this.updatePagination(filteredAreaData);
  }

  onSubmitData() {
    this.validateForm()
    if (!this.isAreaNameEmpty) {
      let data = {name: this.areaName, detail: this.areaDetail}
      if (this.areaId !== undefined) {
        this.updateAreaData(this.areaId, data)
      } else {
        this.insertAreaData(data)
      }
      
    }
  }

  onDeleteData(areaId: any) {
    this.common.showDeleteWarningAlert().then((result) => {
      if (result.value) {
        const deleteData = { is_removed: 1 };
        this.apiService.updateAreaData(areaId, deleteData)
          .subscribe((res: any) => {
            if (res.data == 1) {
              this.getAreaData();
              this.common.showSuccessAlert('Area has been deleted')
            }
          });
      }
    });
  }

  updateAreaData(id: any, data: any) {
    this.apiService.updateAreaData(id, data).subscribe({
      next: (res: any) => this.modalService.dismissAll(),
      error: (err) => console.error(err),
      complete: () => this.getAreaData()
    })
  }

  insertAreaData(data: any) {
    this.apiService.insertAreaData(data).subscribe({
      next: (res: any) => this.modalService.dismissAll(),
      error: (err) => console.error(err),
      complete: () => this.getAreaData()
    })
  }

  openModal(content: any, areaData?: any) {
    if (areaData !== undefined) {
      this.areaId = areaData.area_id
      this.areaName = areaData.name
      this.areaDetail = areaData.detail
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => this.resetModalValue(),
			(reason) => this.resetModalValue()
    )
  }

  validateForm() {
    this.isAreaNameEmpty = this.areaName.trim() === "";
  }

  resetModalValue() {
    this.areaId = undefined
    this.areaName = ''
    this.areaDetail = ''
    this.isAreaNameEmpty = false
  }
}
